import { createServiceClient } from "@/lib/supabase/server";
import { generateCaptionsBatch } from "./captions";
import { generateStoryText } from "./stories";
import { generateReelOverlays } from "./reel-overlays";
import { generatePostImages } from "./images-post";
import { generateStoryImages } from "./images-story";
import { generateReelClips, getPhotoSignedUrls, REEL_MOTION_PROMPTS } from "./video-clips";
import { stitchReelVideo } from "./video-stitch";
import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import type { ContentPiece } from "@/types/content";

const MAX_RETRIES = 2;

/**
 * Retries generation for a single failed content piece.
 * Re-runs the appropriate generation steps based on content_type.
 */
export async function retryPiece(pieceId: string): Promise<void> {
  const supabase = createServiceClient();

  const { data: piece, error: pieceError } = await supabase
    .from("content_pieces")
    .select("*, content_packages!inner(listing_id)")
    .eq("id", pieceId)
    .single();

  if (pieceError || !piece) {
    throw new Error(`Piece ${pieceId} not found`);
  }

  const typedPiece = piece as ContentPiece & {
    content_packages: { listing_id: string };
  };

  if (typedPiece.retry_count >= MAX_RETRIES) {
    throw new Error(`Piece ${pieceId} has reached max retries (${MAX_RETRIES})`);
  }

  const listingId = typedPiece.content_packages.listing_id;

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (!listing) throw new Error(`Listing ${listingId} not found`);

  const { data: brand } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("id", (listing as Listing).brand_profile_id)
    .single();

  if (!brand) throw new Error("Brand profile not found");

  const typedListing = listing as Listing;
  const typedBrand = brand as BrandProfile;

  // Mark as processing and increment retry count
  await supabase
    .from("content_pieces")
    .update({
      status: "processing",
      error_message: null,
      retry_count: typedPiece.retry_count + 1,
    })
    .eq("id", pieceId);

  try {
    if (typedPiece.content_type === "post") {
      await retryPost(typedPiece, typedListing, typedBrand, listingId, supabase);
    } else if (typedPiece.content_type === "story") {
      await retryStory(typedPiece, typedListing, typedBrand, listingId, supabase);
    } else if (typedPiece.content_type === "reel") {
      await retryReel(typedPiece, typedListing, typedBrand, listingId, supabase);
    }

    // Update package counts
    await updatePackageCounts(typedPiece.package_id, supabase);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await supabase
      .from("content_pieces")
      .update({
        status: "failed",
        error_message: `Retry failed: ${message}`,
      })
      .eq("id", pieceId);
  }
}

async function retryPost(
  piece: ContentPiece,
  listing: Listing,
  brand: BrandProfile,
  listingId: string,
  supabase: ReturnType<typeof createServiceClient>
) {
  // Re-generate captions if missing
  if (!piece.caption_instagram) {
    const captions = await generateCaptionsBatch(
      listing,
      brand,
      [{ day_number: piece.day_number, content_type: "post" }],
      listingId
    );
    if (captions.length > 0) {
      await supabase
        .from("content_pieces")
        .update({
          caption_instagram: captions[0].caption_instagram,
          caption_facebook: captions[0].caption_facebook,
          hashtags: captions[0].hashtags,
        })
        .eq("id", piece.id);
    }
  }

  // Re-generate image
  const { errors } = await generatePostImages(listing, brand, [piece], listingId);
  if (errors.length > 0) throw new Error(errors.join("; "));

  await supabase
    .from("content_pieces")
    .update({ status: "complete", generated_at: new Date().toISOString() })
    .eq("id", piece.id);
}

async function retryStory(
  piece: ContentPiece,
  listing: Listing,
  brand: BrandProfile,
  listingId: string,
  supabase: ReturnType<typeof createServiceClient>
) {
  // Re-generate story text if missing
  if (!piece.story_teaser) {
    const stories = await generateStoryText(
      listing,
      brand,
      [piece.day_number],
      listingId
    );
    if (stories.length > 0) {
      await supabase
        .from("content_pieces")
        .update({
          story_teaser: stories[0].story_teaser,
          story_cta: stories[0].story_cta,
          caption_instagram: stories[0].caption_instagram,
          caption_facebook: stories[0].caption_facebook,
          hashtags: stories[0].hashtags,
        })
        .eq("id", piece.id);

      // Re-fetch piece with updated text
      const { data: updated } = await supabase
        .from("content_pieces")
        .select("*")
        .eq("id", piece.id)
        .single();
      if (updated) piece = updated as ContentPiece;
    }
  }

  // Re-generate image
  const { errors } = await generateStoryImages(listing, brand, [piece], listingId);
  if (errors.length > 0) throw new Error(errors.join("; "));

  await supabase
    .from("content_pieces")
    .update({ status: "complete", generated_at: new Date().toISOString() })
    .eq("id", piece.id);
}

async function retryReel(
  piece: ContentPiece,
  listing: Listing,
  brand: BrandProfile,
  listingId: string,
  supabase: ReturnType<typeof createServiceClient>
) {
  // Re-generate captions if missing
  if (!piece.caption_instagram) {
    const captions = await generateCaptionsBatch(
      listing,
      brand,
      [{ day_number: piece.day_number, content_type: "reel" }],
      listingId
    );
    if (captions.length > 0) {
      await supabase
        .from("content_pieces")
        .update({
          caption_instagram: captions[0].caption_instagram,
          caption_facebook: captions[0].caption_facebook,
          hashtags: captions[0].hashtags,
        })
        .eq("id", piece.id);
    }
  }

  // Re-generate overlays if missing
  if (!piece.text_overlay) {
    const overlays = await generateReelOverlays(
      listing,
      brand,
      [piece.day_number],
      listingId
    );
    if (overlays.length > 0) {
      await supabase
        .from("content_pieces")
        .update({ text_overlay: overlays[0].text_overlay })
        .eq("id", piece.id);
    }
  }

  // Re-generate video clips + stitch
  const photoIds = piece.source_photo_ids ?? [];
  const photoUrls = await getPhotoSignedUrls(listingId, photoIds);
  if (photoUrls.length === 0) throw new Error("No photos for reel");

  const motionPrompts = photoUrls.map(
    (_, i) => REEL_MOTION_PROMPTS[i % REEL_MOTION_PROMPTS.length]
  );

  const { clips, errors: clipErrors } = await generateReelClips(
    photoUrls,
    motionPrompts,
    listingId,
    piece.id
  );

  if (clips.length === 0) throw new Error(`All clips failed: ${clipErrors.join("; ")}`);

  let overlayPhrases: string[] = [];
  // Re-fetch piece for latest text_overlay
  const { data: refreshed } = await supabase
    .from("content_pieces")
    .select("text_overlay")
    .eq("id", piece.id)
    .single();
  if (refreshed?.text_overlay) {
    try {
      overlayPhrases = JSON.parse(refreshed.text_overlay as string);
    } catch {
      overlayPhrases = [];
    }
  }

  const clipPaths = clips.sort((a, b) => a.clipIndex - b.clipIndex).map((c) => c.localPath);

  const result = await stitchReelVideo({
    clipPaths,
    textOverlays: overlayPhrases,
    listingId,
    pieceId: piece.id,
    userId: listing.user_id,
    dayNumber: piece.day_number,
    brandTone: brand.tone,
  });

  await supabase
    .from("content_pieces")
    .update({
      asset_path: result.outputPath,
      asset_type: "video",
      status: "complete",
      generated_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", piece.id);
}

async function updatePackageCounts(
  packageId: string,
  supabase: ReturnType<typeof createServiceClient>
) {
  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("status")
    .eq("package_id", packageId);

  if (!pieces) return;

  const completed = pieces.filter((p) => p.status === "complete").length;
  const failed = pieces.filter((p) => p.status === "failed").length;
  const allComplete = pieces.every((p) => p.status === "complete");
  const anyFailed = pieces.some((p) => p.status === "failed");
  const allFailed = pieces.every((p) => p.status === "failed");

  let status: string;
  if (allComplete) status = "complete";
  else if (allFailed) status = "failed";
  else if (anyFailed) status = "partial_failure";
  else status = "processing";

  await supabase
    .from("content_packages")
    .update({
      completed_pieces: completed,
      failed_pieces: failed,
      status,
      processing_completed_at:
        status !== "processing" ? new Date().toISOString() : null,
    })
    .eq("id", packageId);

  // Also update listing status
  const { data: pkg } = await supabase
    .from("content_packages")
    .select("listing_id")
    .eq("id", packageId)
    .single();

  if (pkg) {
    await supabase
      .from("listings")
      .update({
        status: status === "complete" ? "complete" : status === "failed" ? "failed" : "partial_failure",
        updated_at: new Date().toISOString(),
      })
      .eq("id", (pkg as any).listing_id);
  }
}
