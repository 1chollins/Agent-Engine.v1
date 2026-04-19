import { createServiceClient } from "@/lib/supabase/server";
import { generateCaptionsBatch } from "./captions";
import { generateStoryText } from "./stories";
import { generatePostImages } from "./images-post";
import {
  startReelRender,
  startStoryRender,
  finalizeReelRender,
  finalizeStoryRender,
  pollRenderToCompletion,
} from "./creatomate-render";
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
      status: "pending",
      error_message: null,
      retry_count: typedPiece.retry_count + 1,
    })
    .eq("id", pieceId);

  try {
    if (typedPiece.content_type === "post") {
      await retryPost(typedPiece, typedListing, typedBrand, listingId, supabase);
    } else if (typedPiece.content_type === "story") {
      await retryStory(typedPiece, listingId);
    } else if (typedPiece.content_type === "reel") {
      await retryReel(typedPiece, listingId);
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

// Captions/overlays already populated by text gen step; retry only re-renders the video via Creatomate
async function retryReel(
  piece: ContentPiece,
  listingId: string
) {
  const startResult = await startReelRender(
    listingId,
    piece.package_id,
    piece.day_number
  );

  const renderUrl = await pollRenderToCompletion(startResult.renderId);

  await finalizeReelRender({
    renderUrl,
    pieceId: startResult.pieceId,
    listingId,
    userId: startResult.userId,
    dayNumber: piece.day_number,
    templateKey: startResult.templateKey,
  });
}

// Story text re-generated if missing; retry re-renders the video via Creatomate
async function retryStory(
  piece: ContentPiece,
  listingId: string
) {
  if (!piece.story_teaser) {
    const supabase = createServiceClient();

    const { data: listing } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    const { data: brand } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("user_id", (listing as Record<string, unknown>)?.user_id as string)
      .single();

    if (listing && brand) {
      const stories = await generateStoryText(
        listing as Listing,
        brand as BrandProfile,
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
      }
    }
  }

  // Start Creatomate render, poll to completion, download + upload
  const startResult = await startStoryRender(
    listingId,
    piece.package_id,
    piece.day_number
  );

  const renderUrl = await pollRenderToCompletion(startResult.renderId);

  await finalizeStoryRender({
    renderUrl,
    pieceId: startResult.pieceId,
    listingId,
    userId: startResult.userId,
    dayNumber: piece.day_number,
    templateKey: startResult.templateKey,
  });
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
      .eq("id", (pkg as Record<string, unknown>).listing_id as string);
  }
}
