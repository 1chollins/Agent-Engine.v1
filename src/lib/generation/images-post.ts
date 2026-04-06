import { createServiceClient } from "@/lib/supabase/server";
import { renderToImage } from "./image-renderer";
import { buildPostTemplate } from "./templates/post-template";
import { loadListingPhoto, loadBrandAsset } from "./photo-loader";
import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import type { ContentPiece } from "@/types/content";

type PostImageResult = {
  pieceId: string;
  assetPath: string;
  assetPathAlt: string;
};

export async function generatePostImages(
  listing: Listing,
  brand: BrandProfile,
  postPieces: ContentPiece[],
  listingId: string
): Promise<{ results: PostImageResult[]; errors: string[] }> {
  const supabase = createServiceClient();
  const results: PostImageResult[] = [];
  const errors: string[] = [];

  // Pre-load brand assets once
  const [headshot, logo] = await Promise.all([
    loadBrandAsset(brand.headshot_path),
    loadBrandAsset(brand.logo_path),
  ]);

  for (const piece of postPieces) {
    const startTime = Date.now();

    try {
      // Load listing photo for this piece
      const photo = await loadListingPhoto(listingId, piece.source_photo_ids);
      if (!photo) {
        throw new Error(`No photo available for day ${piece.day_number}`);
      }

      const templateProps = {
        listing,
        brand,
        photoBase64: photo.base64,
        photoMimeType: photo.mimeType,
        headshot64: headshot?.base64 ?? null,
        logo64: logo?.base64 ?? null,
      };

      // Generate both IG (1080x1080) and FB (1200x630) versions in parallel
      const [igBuffer, fbBuffer] = await Promise.all([
        renderToImage(
          buildPostTemplate({ ...templateProps, variant: "square" }),
          1080,
          1080
        ),
        renderToImage(
          buildPostTemplate({ ...templateProps, variant: "landscape" }),
          1200,
          630
        ),
      ]);

      // Upload to Supabase Storage
      const basePath = `${listing.user_id}/${listingId}/posts`;
      const igPath = `${basePath}/day-${piece.day_number}-ig.png`;
      const fbPath = `${basePath}/day-${piece.day_number}-fb.png`;

      const [igUpload, fbUpload] = await Promise.all([
        supabase.storage
          .from("generated-content")
          .upload(igPath, igBuffer, {
            contentType: "image/png",
            upsert: true,
          }),
        supabase.storage
          .from("generated-content")
          .upload(fbPath, fbBuffer, {
            contentType: "image/png",
            upsert: true,
          }),
      ]);

      if (igUpload.error) throw new Error(`IG upload failed: ${igUpload.error.message}`);
      if (fbUpload.error) throw new Error(`FB upload failed: ${fbUpload.error.message}`);

      const elapsed = Date.now() - startTime;

      // Update piece with asset paths
      await supabase
        .from("content_pieces")
        .update({
          asset_path: igPath,
          asset_path_alt: fbPath,
          asset_type: "image",
        })
        .eq("id", piece.id);

      // Log cost ($0 for self-hosted rendering)
      await supabase.from("cost_logs").insert({
        listing_id: listingId,
        content_piece_id: piece.id,
        service: "bannerbear", // using the schema's allowed service enum
        endpoint: "self-hosted:post-image",
        cost_usd: 0,
        response_time_ms: elapsed,
        success: true,
      });

      results.push({
        pieceId: piece.id,
        assetPath: igPath,
        assetPathAlt: fbPath,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Post image generation failed for day ${piece.day_number}:`, message);
      errors.push(`Day ${piece.day_number}: ${message}`);

      // Mark piece as failed
      await supabase
        .from("content_pieces")
        .update({
          status: "failed",
          error_message: `Image generation failed: ${message}`,
        })
        .eq("id", piece.id);

      // Log failed cost entry
      await supabase.from("cost_logs").insert({
        listing_id: listingId,
        content_piece_id: piece.id,
        service: "bannerbear",
        endpoint: "self-hosted:post-image",
        cost_usd: 0,
        response_time_ms: Date.now() - startTime,
        success: false,
        error_message: message,
      });
    }
  }

  return { results, errors };
}
