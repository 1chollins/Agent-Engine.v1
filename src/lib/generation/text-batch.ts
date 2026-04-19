import { createServiceClient } from "@/lib/supabase/server";
import { generateCaptionsBatch } from "./captions";
import { generateStoryText } from "./stories";
import { generateReelOverlays } from "./reel-overlays";
import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import type { ContentPiece, ContentType } from "@/types/content";

type PieceUpdate = {
  id: string;
  caption_instagram?: string;
  caption_facebook?: string;
  hashtags?: string;
  text_overlay?: string;
  story_teaser?: string;
  story_cta?: string;
  status: "complete" | "pending" | "failed";
  error_message?: string;
  generated_at?: string;
};

export async function runTextGeneration(
  listingId: string,
  packageId: string
): Promise<{ succeeded: number; failed: number }> {
  const supabase = createServiceClient();

  // Load listing + brand profile
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    throw new Error(`Failed to load listing ${listingId}: ${listingError?.message}`);
  }

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("id", (listing as Listing).brand_profile_id)
    .single();

  if (brandError || !brand) {
    throw new Error(`Failed to load brand profile: ${brandError?.message}`);
  }

  // Load content pieces for this package
  const { data: pieces, error: piecesError } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("package_id", packageId)
    .order("day_number");

  if (piecesError || !pieces) {
    throw new Error(`Failed to load content pieces: ${piecesError?.message}`);
  }

  const typedListing = listing as Listing;
  const typedBrand = brand as BrandProfile;
  const typedPieces = pieces as ContentPiece[];

  const posts = typedPieces.filter((p) => p.content_type === "post");
  const reels = typedPieces.filter((p) => p.content_type === "reel");
  const stories = typedPieces.filter((p) => p.content_type === "story");

  const updates: PieceUpdate[] = [];

  // Run all three generation types in parallel
  const [captionResults, storyResults, overlayResults] = await Promise.allSettled([
    generateCaptionsBatch(
      typedListing,
      typedBrand,
      [...posts, ...reels].map((p) => ({
        day_number: p.day_number,
        content_type: p.content_type as ContentType,
      })),
      listingId
    ),
    generateStoryText(
      typedListing,
      typedBrand,
      stories.map((p) => p.day_number),
      listingId
    ),
    generateReelOverlays(
      typedListing,
      typedBrand,
      reels.map((p) => p.day_number),
      listingId
    ),
  ]);

  // Process caption results (posts + reels)
  if (captionResults.status === "fulfilled") {
    for (const result of captionResults.value) {
      const piece = typedPieces.find((p) => p.day_number === result.day_number);
      if (!piece) continue;

      const existing = updates.find((u) => u.id === piece.id);
      if (existing) {
        existing.caption_instagram = result.caption_instagram;
        existing.caption_facebook = result.caption_facebook;
        existing.hashtags = result.hashtags;
      } else {
        updates.push({
          id: piece.id,
          caption_instagram: result.caption_instagram,
          caption_facebook: result.caption_facebook,
          hashtags: result.hashtags,
          status: piece.content_type === "post" ? "complete" : "pending",
          generated_at: new Date().toISOString(),
        });
      }
    }
  } else {
    console.error("Caption generation failed:", captionResults.reason);
    // Mark all posts and reels as failed for captions
    for (const piece of [...posts, ...reels]) {
      const existing = updates.find((u) => u.id === piece.id);
      if (!existing) {
        updates.push({
          id: piece.id,
          status: "failed",
          error_message: `Caption generation failed: ${captionResults.reason?.message ?? "Unknown error"}`,
        });
      }
    }
  }

  // Process story results
  if (storyResults.status === "fulfilled") {
    for (const result of storyResults.value) {
      const piece = typedPieces.find((p) => p.day_number === result.day_number);
      if (!piece) continue;

      updates.push({
        id: piece.id,
        story_teaser: result.story_teaser,
        story_cta: result.story_cta,
        caption_instagram: result.caption_instagram,
        caption_facebook: result.caption_facebook,
        hashtags: result.hashtags,
        status: "pending",
        generated_at: new Date().toISOString(),
      });
    }
  } else {
    console.error("Story text generation failed:", storyResults.reason);
    for (const piece of stories) {
      updates.push({
        id: piece.id,
        status: "failed",
        error_message: `Story text generation failed: ${storyResults.reason?.message ?? "Unknown error"}`,
      });
    }
  }

  // Process reel overlay results — merge into existing reel updates
  if (overlayResults.status === "fulfilled") {
    for (const result of overlayResults.value) {
      const existing = updates.find(
        (u) =>
          u.id ===
          typedPieces.find((p) => p.day_number === result.day_number)?.id
      );
      if (existing) {
        existing.text_overlay = result.text_overlay;
      } else {
        const piece = typedPieces.find(
          (p) => p.day_number === result.day_number
        );
        if (piece) {
          updates.push({
            id: piece.id,
            text_overlay: result.text_overlay,
            status: "complete",
            generated_at: new Date().toISOString(),
          });
        }
      }
    }
  } else {
    console.error("Reel overlay generation failed:", overlayResults.reason);
    // Don't mark reels as failed just for overlays — captions may have succeeded
    for (const piece of reels) {
      const existing = updates.find((u) => u.id === piece.id);
      if (existing && existing.status !== "failed") {
        // Reel still has captions, just missing overlays — note the partial failure
        existing.error_message = `Overlay generation failed: ${overlayResults.reason?.message ?? "Unknown error"}`;
      }
    }
  }

  // Write all updates to database
  let succeeded = 0;
  let failed = 0;

  for (const update of updates) {
    const { id, ...fields } = update;
    const { error } = await supabase
      .from("content_pieces")
      .update(fields)
      .eq("id", id);

    if (error) {
      console.error(`Failed to update piece ${id}:`, error);
      failed++;
    } else {
      if (fields.status === "complete") succeeded++;
      else failed++;
    }
  }

  // Update package completed/failed counts
  await supabase
    .from("content_packages")
    .update({
      completed_pieces: succeeded,
      failed_pieces: failed,
    })
    .eq("id", packageId);

  console.log(
    `Text generation complete for listing ${listingId}: ${succeeded} succeeded, ${failed} failed`
  );

  return { succeeded, failed };
}
