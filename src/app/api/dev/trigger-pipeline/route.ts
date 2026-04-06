import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { runGenerationPipeline } from "@/lib/generation/pipeline";

/**
 * Development-only endpoint to manually trigger the content generation pipeline.
 * Use when Stripe webhooks aren't configured locally.
 *
 * POST /api/dev/trigger-pipeline
 * Body: { listingId: string }
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await request.json();
  if (!listingId) {
    return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
  }

  // Verify ownership
  const { data: listing } = await supabase
    .from("listings")
    .select("id, status")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .single();

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Update listing status to processing
  const serviceClient = createServiceClient();
  await serviceClient
    .from("listings")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", listingId);

  // Also update any pending payment to succeeded
  await serviceClient
    .from("payments")
    .update({ status: "succeeded", paid_at: new Date().toISOString() })
    .eq("listing_id", listingId)
    .eq("status", "pending");

  // Trigger pipeline async
  runGenerationPipeline(listingId).catch((err) => {
    console.error(`Dev pipeline failed for listing ${listingId}:`, err);
  });

  return NextResponse.json({
    success: true,
    message: `Pipeline triggered for listing ${listingId}`,
  });
}
