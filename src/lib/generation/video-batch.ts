import { createServiceClient } from "@/lib/supabase/server";
import {
  generateReelClips,
  getPhotoSignedUrls,
  REEL_MOTION_PROMPTS,
} from "./video-clips";
import { stitchReelVideo } from "./video-stitch";
import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import type { ContentPiece } from "@/types/content";

/**
 * Generates all 5 reel videos for a content package.
 * For each reel:
 * 1. Get signed URLs for assigned photos
 * 2. Generate 4-5 video clips via Runway
 * 3. Stitch clips with crossfade, text overlays, and music via FFmpeg
 * 4. Upload final video and update content_pieces
 */
export async function runVideoGeneration(
  listingId: string,
  packageId: string
): Promise<{ succeeded: number; failed: number }> {
  const supabase = createServiceClient();

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

  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("package_id", packageId)
    .eq("content_type", "reel")
    .order("day_number");

  if (!pieces) throw new Error("No reel pieces found");

  const typedListing = listing as Listing;
  const typedBrand = brand as BrandProfile | null;
  const reelPieces = pieces as ContentPiece[];

  let succeeded = 0;
  let failed = 0;

  // Process reels sequentially to stay within Runway rate limits
  // (each reel already uses up to MAX_CONCURRENT parallel clip generations)
  for (const piece of reelPieces) {
    const startTime = Date.now();

    try {
      // Mark piece as processing
      await supabase
        .from("content_pieces")
        .update({ status: "processing" })
        .eq("id", piece.id);

      // Get signed URLs for photos assigned to this reel
      const photoIds = piece.source_photo_ids ?? [];
      if (photoIds.length === 0) {
        throw new Error("No photos assigned to this reel");
      }

      const photoUrls = await getPhotoSignedUrls(listingId, photoIds);
      if (photoUrls.length === 0) {
        throw new Error("Could not get signed URLs for assigned photos");
      }

      // Generate motion prompts — cycle through defaults
      const motionPrompts = photoUrls.map(
        (_, i) => REEL_MOTION_PROMPTS[i % REEL_MOTION_PROMPTS.length]
      );

      // Generate video clips
      const { clips, errors: clipErrors } = await generateReelClips(
        photoUrls,
        motionPrompts,
        listingId,
        piece.id
      );

      if (clips.length === 0) {
        throw new Error(
          `All clips failed: ${clipErrors.join("; ")}`
        );
      }

      // Parse text overlays
      let overlayPhrases: string[] = [];
      if (piece.text_overlay) {
        try {
          overlayPhrases = JSON.parse(piece.text_overlay);
        } catch {
          overlayPhrases = [];
        }
      }

      // Stitch clips into final reel
      const clipStoragePaths = clips
        .sort((a, b) => a.clipIndex - b.clipIndex)
        .map((c) => c.localPath);

      const result = await stitchReelVideo({
        clipPaths: clipStoragePaths,
        textOverlays: overlayPhrases,
        listingId,
        pieceId: piece.id,
        userId: typedListing.user_id,
        dayNumber: piece.day_number,
        brandTone: typedBrand?.tone,
      });

      // Update piece with final video path
      await supabase
        .from("content_pieces")
        .update({
          asset_path: result.outputPath,
          asset_type: "video",
          status: "complete",
          generated_at: new Date().toISOString(),
          error_message: clipErrors.length > 0
            ? `${clips.length} clips succeeded, ${clipErrors.length} failed`
            : null,
        })
        .eq("id", piece.id);

      succeeded++;
      console.log(
        `Reel day ${piece.day_number} complete (${Date.now() - startTime}ms): ` +
        `${clips.length} clips, ${result.durationSeconds}s`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Reel day ${piece.day_number} failed:`, message);

      await supabase
        .from("content_pieces")
        .update({
          status: "failed",
          error_message: `Video generation failed: ${message}`,
          retry_count: piece.retry_count,
        })
        .eq("id", piece.id);

      failed++;
    }
  }

  console.log(
    `Video generation complete for listing ${listingId}: ${succeeded} reels succeeded, ${failed} failed`
  );

  return { succeeded, failed };
}
