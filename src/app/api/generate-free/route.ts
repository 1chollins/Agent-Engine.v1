import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inngest } from "@/inngest/client";
import { MIN_PHOTOS, MIN_VERTICAL_PHOTOS } from "@/types/listing";

/**
 * Free tier of the ladder: generates the full 14-piece campaign with the
 * Frame & Form watermark, no checkout. The watermark applies automatically
 * because no succeeded payment exists for the listing. Paying $20 later
 * (or using a booking promo code) resets the package and re-renders clean.
 */
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

  // Verify listing belongs to user
  const { data: listing } = await supabase
    .from("listings")
    .select("id, status")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .single();

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Only draft / pending_payment / failed listings can start a free run.
  // Complete listings must go through the paid unlock (which resets pieces).
  if (listing.status === "processing") {
    return NextResponse.json(
      { error: "This listing is already generating" },
      { status: 400 }
    );
  }
  if (listing.status === "complete" || listing.status === "partial_failure") {
    return NextResponse.json(
      { error: "This listing already has a campaign. Remove the watermark from the content page." },
      { status: 400 }
    );
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

  // Mark processing and kick off the pipeline — no payment row on purpose.
  await supabase
    .from("listings")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", listingId);

  await inngest.send({
    name: "package/generation.requested",
    data: { listing_id: listingId, user_id: user.id },
  });

  return NextResponse.json({ started: true });
}
