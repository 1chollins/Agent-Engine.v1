import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { MIN_PHOTOS, MIN_VERTICAL_PHOTOS } from "@/types/listing";

const PACKAGE_PRICE_CENTS = Number(process.env.PACKAGE_PRICE_CENTS || "9900");

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await request.json();

  if (!listingId) {
    return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
  }

  // Verify listing belongs to user and is in draft status
  const { data: listing } = await supabase
    .from("listings")
    .select("id, address, city, state, status")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .single();

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Verify photo count
  const { count } = await supabase
    .from("listing_photos")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  if (!count || count < MIN_PHOTOS) {
    return NextResponse.json(
      { error: `Need at least ${MIN_PHOTOS} photos (${count ?? 0} uploaded)` },
      { status: 400 }
    );
  }

  // Verify vertical photo count (0 or >= MIN_VERTICAL_PHOTOS)
  const { count: verticalCount } = await supabase
    .from("listing_photos")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId)
    .eq("orientation", "vertical");

  const vCount = verticalCount ?? 0;
  if (vCount > 0 && vCount < MIN_VERTICAL_PHOTOS) {
    return NextResponse.json(
      { error: `Upload at least ${MIN_VERTICAL_PHOTOS} vertical photos or remove them all (${vCount} uploaded)` },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const origin = request.headers.get("origin") || "";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: PACKAGE_PRICE_CENTS,
          product_data: {
            name: "14-Day Content Package",
            description: `${listing.address}, ${listing.city}, ${listing.state}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      listing_id: listingId,
      user_id: user.id,
    },
    success_url: `${origin}/listings/${listingId}/processing`,
    cancel_url: `${origin}/listings/${listingId}/review`,
  });

  // Create payment record
  await supabase.from("payments").insert({
    user_id: user.id,
    listing_id: listingId,
    stripe_checkout_session_id: session.id,
    amount_cents: PACKAGE_PRICE_CENTS,
    status: "pending",
  });

  // Update listing status
  await supabase
    .from("listings")
    .update({ status: "pending_payment", updated_at: new Date().toISOString() })
    .eq("id", listingId);

  return NextResponse.json({ url: session.url });
}
