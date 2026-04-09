import { createServiceClient } from "@/lib/supabase/server";
import {
  generateReelClips,
  getPhotoSignedUrls,
  REEL_MOTION_PROMPTS,
} from "./video-clips";
import { stitchReelVideo } from "./video-stitch";
import type { ContentPiece } from "@/types/content";

/**
 * Generates a single reel video for one content piece.
 * Extracted from video-batch.ts for use in both the Inngest per-reel steps
 * and the local dev pipeline.
 *
 * Limits to 1 clip per reel to stay within Vercel's 60s function timeout.
 * Falls back to the raw clip when FFmpeg is unavailable.
 */
export async function generateSingleReel(
  listingId: string,
  packageId: string,
  dayNumber: number
): Promise<{ succeeded: boolean; error?: string }> {
  const supabase = createServiceClient();

  const { data: piece } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("package_id", packageId)
    .eq("day_number", dayNumber)
    .eq("content_type", "reel")
    .single();

  if (!piece) {
    return { succeeded: false, error: `No reel piece found for day ${dayNumber}` };
  }

  const typedPiece = piece as ContentPiece;

  // Load listing for user_id
  const { data: listing } = await supabase
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .single();

  if (!listing) {
    return { succeeded: false, error: "Listing not found" };
  }

  // Load brand for tone
  const { data: brand } = await supabase
    .from("brand_profiles")
    .select("tone")
    .eq("user_id", (listing as Record<string, unknown>).user_id as string)
    .single();

  const userId = (listing as Record<string, unknown>).user_id as string;

  try {
    await supabase
      .from("content_pieces")
      .update({ status: "processing" })
      .eq("id", typedPiece.id);

    const photoIds = typedPiece.source_photo_ids ?? [];
    if (photoIds.length === 0) {
      throw new Error("No photos assigned to this reel");
    }

    // Limit to 1 photo/clip to stay within 60s serverless timeout
    const photoUrls = await getPhotoSignedUrls(listingId, [photoIds[0]]);
    if (photoUrls.length === 0) {
      throw new Error("Could not get signed URL for photo");
    }

    const motionPrompt = REEL_MOTION_PROMPTS[dayNumber % REEL_MOTION_PROMPTS.length];

    const { clips, errors: clipErrors } = await generateReelClips(
      photoUrls,
      [motionPrompt],
      listingId,
      typedPiece.id
    );

    if (clips.length === 0) {
      throw new Error(`Clip generation failed: ${clipErrors.join("; ")}`);
    }

    const clipPath = clips[0].localPath;
    let finalAssetPath: string;
    let note = "";

    try {
      const result = await stitchReelVideo({
        clipPaths: [clipPath],
        textOverlays: parseOverlays(typedPiece.text_overlay),
        listingId,
        pieceId: typedPiece.id,
        userId,
        dayNumber,
        brandTone: (brand as Record<string, unknown> | null)?.tone as string | undefined,
      });
      finalAssetPath = result.outputPath;
    } catch {
      // FFmpeg not available — use raw clip
      finalAssetPath = `${userId}/${listingId}/reels/day-${dayNumber}.mp4`;
      const { data: clipData } = await supabase.storage
        .from("generated-content")
        .download(clipPath);
      if (clipData) {
        const buffer = Buffer.from(await clipData.arrayBuffer());
        await supabase.storage
          .from("generated-content")
          .upload(finalAssetPath, buffer, { contentType: "video/mp4", upsert: true });
      }
      note = " (single clip — FFmpeg not available)";
    }

    await supabase
      .from("content_pieces")
      .update({
        asset_path: finalAssetPath,
        asset_type: "video",
        status: "complete",
        generated_at: new Date().toISOString(),
        error_message: note || null,
      })
      .eq("id", typedPiece.id);

    return { succeeded: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await supabase
      .from("content_pieces")
      .update({
        status: "failed",
        error_message: `Video generation failed: ${message}`,
      })
      .eq("id", typedPiece.id);

    return { succeeded: false, error: message };
  }
}

function parseOverlays(raw: string | null): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
