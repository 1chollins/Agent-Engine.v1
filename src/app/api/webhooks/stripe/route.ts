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
      // $0 sessions (100%-off booking promo codes) have no payment intent
      stripe_payment_intent_id: (session.payment_intent as string | null) ?? null,
      receipt_url: null, // Stripe receipt URL populated asynchronously
      paid_at: new Date().toISOString(),
    },
    { onConflict: "listing_id" }
  );
  if (paymentError) {
    console.error("Failed to record payment:", paymentError.message);
  }

  // Watermark unlock: if this listing already has a finished (watermarked)
  // package, reset it so the pipeline re-renders every piece clean. Without
  // this reset, generate-package short-circuits on "complete" and the user
  // would pay $20 for nothing.
  const { data: pkg } = await supabase
    .from("content_packages")
    .select("id, status")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pkg && (pkg.status === "complete" || pkg.status === "partial_failure")) {
    await supabase
      .from("content_packages")
      .update({
        status: "processing",
        completed_pieces: 0,
        failed_pieces: 0,
        processing_started_at: new Date().toISOString(),
        processing_completed_at: null,
      })
      .eq("id", pkg.id);

    await supabase
      .from("content_pieces")
      .update({
        status: "pending",
        error_message: null,
        generated_at: null,
        retry_count: 0,
      })
      .eq("package_id", pkg.id);
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
