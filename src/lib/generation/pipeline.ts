/**
 * LOCAL DEV ONLY — production uses Inngest functions in src/inngest/functions/.
 * Do not call from production code.
 *
 * This file is kept for local development and testing where Inngest
 * is not available. Use the Inngest generate-package function for production.
 */
import { createServiceClient } from "@/lib/supabase/server";
import { CONTENT_CALENDAR } from "@/types/content";
import type { ListingPhoto } from "@/types/listing";
import { runTextGeneration } from "./text-batch";
import { runImageGeneration } from "./image-batch";
import { runVideoGeneration } from "./video-batch";
import { pickPhotosForPackage } from "./photo-picker";

export async function runGenerationPipeline(listingId: string): Promise<void> {
  const supabase = createServiceClient();

  // Create content package
  const { data: pkg, error: pkgError } = await supabase
    .from("content_packages")
    .insert({
      listing_id: listingId,
      status: "processing",
      total_pieces: 14,
      processing_started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (pkgError || !pkg) {
    console.error("Failed to create content package:", pkgError);
    await markListingFailed(supabase, listingId);
    return;
  }

  // Fetch listing for vertical hero
  const { data: listing } = await supabase
    .from("listings")
    .select("vertical_hero_photo_id")
    .eq("id", listingId)
    .single();

  // Fetch photos for assignment
  const { data: photos } = await supabase
    .from("listing_photos")
    .select("*")
    .eq("listing_id", listingId)
    .order("sort_order");

  const typedPhotos = (photos ?? []) as ListingPhoto[];
  const photoAssignments = pickPhotosForPackage(typedPhotos, {
    reelPhotoCount: 5,
    verticalHeroId: listing?.vertical_hero_photo_id ?? null,
  });

  // Create 14 content pieces
  const pieces = CONTENT_CALENDAR.map((entry, index) => ({
    package_id: pkg.id,
    day_number: entry.day,
    content_type: entry.type,
    platform: entry.platform,
    status: "pending" as const,
    recommended_time: entry.time,
    source_photo_ids: photoAssignments[index] ?? [],
  }));

  const { error: piecesError } = await supabase
    .from("content_pieces")
    .insert(pieces);

  if (piecesError) {
    console.error("Failed to create content pieces:", piecesError);
    await supabase
      .from("content_packages")
      .update({
        status: "failed",
        processing_completed_at: new Date().toISOString(),
      })
      .eq("id", pkg.id);
    await markListingFailed(supabase, listingId);
    return;
  }

  // --- Text Generation (Sprint 4) ---
  try {
    const textResult = await runTextGeneration(listingId, pkg.id);
    console.log(
      `Text generation complete for listing ${listingId}: ` +
      `${textResult.succeeded} succeeded, ${textResult.failed} failed`
    );
  } catch (err) {
    console.error(`Text generation failed for listing ${listingId}:`, err);
    // Text failure is not fatal — mark package as partial_failure
    // and continue. Image/video generation will run in future sprints.
  }

  // --- Image Generation + Video Generation (run in parallel) ---
  const [imageResult, videoResult] = await Promise.allSettled([
    runImageGeneration(listingId, pkg.id),
    runVideoGeneration(listingId, pkg.id),
  ]);

  if (imageResult.status === "fulfilled") {
    console.log(
      `Image generation complete for listing ${listingId}: ` +
      `${imageResult.value.succeeded} succeeded, ${imageResult.value.failed} failed`
    );
  } else {
    console.error(`Image generation failed for listing ${listingId}:`, imageResult.reason);
  }

  if (videoResult.status === "fulfilled") {
    console.log(
      `Video generation complete for listing ${listingId}: ` +
      `${videoResult.value.succeeded} succeeded, ${videoResult.value.failed} failed`
    );
  } else {
    console.error(`Video generation failed for listing ${listingId}:`, videoResult.reason);
  }

  // Determine final package status
  const { data: finalPieces } = await supabase
    .from("content_pieces")
    .select("status")
    .eq("package_id", pkg.id);

  const allComplete = finalPieces?.every((p) => p.status === "complete");
  const anyFailed = finalPieces?.some((p) => p.status === "failed");
  const allFailed = finalPieces?.every((p) => p.status === "failed");

  let packageStatus: string;
  let listingStatus: string;

  if (allFailed) {
    packageStatus = "failed";
    listingStatus = "failed";
  } else if (anyFailed) {
    packageStatus = "partial_failure";
    listingStatus = "partial_failure";
  } else if (allComplete) {
    packageStatus = "complete";
    listingStatus = "complete";
  } else {
    // Some still pending (awaiting image/video gen in future sprints)
    packageStatus = "processing";
    listingStatus = "processing";
  }

  await supabase
    .from("content_packages")
    .update({
      status: packageStatus,
      processing_completed_at:
        packageStatus !== "processing" ? new Date().toISOString() : null,
    })
    .eq("id", pkg.id);

  await supabase
    .from("listings")
    .update({ status: listingStatus, updated_at: new Date().toISOString() })
    .eq("id", listingId);

  console.log(
    `Pipeline complete for listing ${listingId}: package ${pkg.id} — ${packageStatus}`
  );
}

async function markListingFailed(
  supabase: ReturnType<typeof createServiceClient>,
  listingId: string
) {
  await supabase
    .from("listings")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("id", listingId);
}
