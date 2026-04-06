import { createServiceClient } from "@/lib/supabase/server";
import { renderToImage } from "./image-renderer";
import { buildStoryTemplate } from "./templates/story-template";
import { loadListingPhoto, loadBrandAsset } from "./photo-loader";
import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import type { ContentPiece } from "@/types/content";

type StoryImageResult = {
  pieceId: string;
  assetPath: string;
};

export async function generateStoryImages(
  listing: Listing,
  brand: BrandProfile,
  storyPieces: ContentPiece[],
  listingId: string
): Promise<{ results: StoryImageResult[]; errors: string[] }> {
  const supabase = createServiceClient();
  const results: StoryImageResult[] = [];
  const errors: string[] = [];

  // Pre-load brand assets once
  const [headshot, logo] = await Promise.all([
    loadBrandAsset(brand.headshot_path),
    loadBrandAsset(brand.logo_path),
  ]);

  for (const piece of storyPieces) {
    const startTime = Date.now();

    try {
      const photo = await loadListingPhoto(listingId, piece.source_photo_ids);
      if (!photo) {
        throw new Error(`No photo available for day ${piece.day_number}`);
      }

      const teaser = piece.story_teaser ?? "New Listing";
      const cta = piece.story_cta ?? `Contact ${brand.agent_name}`;

      const template = buildStoryTemplate({
        listing,
        brand,
        photoBase64: photo.base64,
        photoMimeType: photo.mimeType,
        headshot64: headshot?.base64 ?? null,
        logo64: logo?.base64 ?? null,
        teaser,
        cta,
      });

      const buffer = await renderToImage(template, 1080, 1920);

      // Upload to Supabase Storage
      const storagePath = `${listing.user_id}/${listingId}/stories/day-${piece.day_number}.png`;

      const { error: uploadError } = await supabase.storage
        .from("generated-content")
        .upload(storagePath, buffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const elapsed = Date.now() - startTime;

      // Update piece
      await supabase
        .from("content_pieces")
        .update({
          asset_path: storagePath,
          asset_type: "image",
        })
        .eq("id", piece.id);

      // Log cost ($0 self-hosted)
      await supabase.from("cost_logs").insert({
        listing_id: listingId,
        content_piece_id: piece.id,
        service: "bannerbear",
        endpoint: "self-hosted:story-image",
        cost_usd: 0,
        response_time_ms: elapsed,
        success: true,
      });

      results.push({ pieceId: piece.id, assetPath: storagePath });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Story image failed for day ${piece.day_number}:`, message);
      errors.push(`Day ${piece.day_number}: ${message}`);

      await supabase
        .from("content_pieces")
        .update({
          status: "failed",
          error_message: `Image generation failed: ${message}`,
        })
        .eq("id", piece.id);

      await supabase.from("cost_logs").insert({
        listing_id: listingId,
        content_piece_id: piece.id,
        service: "bannerbear",
        endpoint: "self-hosted:story-image",
        cost_usd: 0,
        response_time_ms: Date.now() - startTime,
        success: false,
        error_message: message,
      });
    }
  }

  return { results, errors };
}
