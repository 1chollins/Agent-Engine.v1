import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { inngest } from "@/inngest/client";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = (
    process.env.STRIPE_WEBHOOK_SECRET ?? process.env.STRIPE_WEBHOOK_SIGNING_SECRET ?? ""
  ).trim();

  if (!webhookSecret) {
    // Log which Stripe-related env vars exist (names only) for debugging
    const stripeVars = Object.keys(process.env)
      .filter((k) => k.startsWith("STRIPE"))
      .join(", ");
    console.error(
      `Missing STRIPE_WEBHOOK_SECRET. Available STRIPE_* vars: [${stripeVars || "none"}]`
    );
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createServiceClient();
  const listingId = session.metadata?.listing_id;

  if (!listingId) {
    console.error("No listing_id in checkout session metadata");
    return;
  }

  // Idempotency check — skip if this listing's payment already succeeded
  const { data: existing } = await supabase
    .from("payments")
    .select("status")
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing?.status === "succeeded") {
    console.log(`Payment for listing ${listingId} already processed, skipping`);
    return;
  }

  // Upsert (not update): guarantees the revenue record exists even if
  // the checkout route failed to create the pending row first.
  const { error: paymentError } = await supabase.from("payments").upsert(
    {
      user_id: session.metadata?.user_id ?? null,
      listing_id: listingId,
      stripe_checkout_session_id: session.id,
      amount_cents: session.amount_total ?? 0,
      status: "succeeded",
      stripe_payment_intent_id: session.payment_intent as string,
      receipt_url: null, // Stripe receipt URL populated asynchronously
      paid_at: new Date().toISOString(),
    },
    { onConflict: "listing_id" }
  );
  if (paymentError) {
    console.error("Failed to record payment:", paymentError.message);
  }

  // Update listing status to processing
  await supabase
    .from("listings")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", listingId);

  // Trigger generation pipeline via Inngest
  await inngest.send({
    name: "package/generation.requested",
    data: {
      listing_id: listingId,
      user_id: session.metadata?.user_id ?? "",
    },
  });
}
