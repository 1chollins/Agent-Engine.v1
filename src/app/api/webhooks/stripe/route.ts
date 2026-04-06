import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { runGenerationPipeline } from "@/lib/generation/pipeline";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
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

  // Idempotency check — skip if payment already processed
  const { data: existing } = await supabase
    .from("payments")
    .select("status")
    .eq("stripe_checkout_session_id", session.id)
    .single();

  if (existing?.status === "succeeded") {
    console.log(`Payment ${session.id} already processed, skipping`);
    return;
  }

  // Update payment record
  await supabase
    .from("payments")
    .update({
      status: "succeeded",
      stripe_payment_intent_id: session.payment_intent as string,
      receipt_url: null, // Stripe receipt URL populated asynchronously
      paid_at: new Date().toISOString(),
    })
    .eq("stripe_checkout_session_id", session.id);

  // Update listing status to processing
  await supabase
    .from("listings")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", listingId);

  // Trigger generation pipeline (async — don't block webhook response)
  runGenerationPipeline(listingId).catch((err) => {
    console.error(`Generation pipeline failed for listing ${listingId}:`, err);
  });
}
