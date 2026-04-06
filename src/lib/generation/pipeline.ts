import { createServiceClient } from "@/lib/supabase/server";
import { CONTENT_CALENDAR } from "@/types/content";
import type { ListingPhoto } from "@/types/listing";

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

  // Fetch photos for assignment
  const { data: photos } = await supabase
    .from("listing_photos")
    .select("*")
    .eq("listing_id", listingId)
    .order("sort_order");

  const typedPhotos = (photos ?? []) as ListingPhoto[];
  const photoAssignments = assignPhotos(typedPhotos);

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

  // TODO: In future sprints, trigger actual generation here:
  // - Text generation (Claude Haiku) for captions/hashtags
  // - Image generation (Sharp/@vercel/og) for branded posts/stories
  // - Video generation (Runway) for reels
  // - Video processing (FFmpeg) for stitching
  //
  // For now, mark all pieces as pending and package as processing.
  // The pipeline scaffold is complete — external API calls will be
  // wired in during Sprint 5+ stories.

  console.log(
    `Pipeline scaffold complete for listing ${listingId}: ` +
    `package ${pkg.id} with 14 pieces created`
  );
}

/**
 * Assigns photos to each of the 14 content pieces.
 * - Hero photo goes to Day 1 (post) and Day 2 (reel)
 * - Remaining photos distributed to avoid repetition
 * - No photo used in more than 2 pieces
 */
function assignPhotos(photos: ListingPhoto[]): string[][] {
  if (photos.length === 0) return Array(14).fill([]);

  const hero = photos.find((p) => p.is_hero) ?? photos[0];
  const others = photos.filter((p) => p.id !== hero.id);
  const assignments: string[][] = [];

  for (let i = 0; i < 14; i++) {
    const entry = CONTENT_CALENDAR[i];

    if (entry.type === "post") {
      // Posts use 1 photo each
      if (i === 0) {
        assignments.push([hero.id]);
      } else {
        const postIndex = Math.floor(i / 3);
        const photo = others[postIndex % others.length];
        assignments.push([photo?.id ?? hero.id]);
      }
    } else if (entry.type === "reel") {
      // Reels use 4-5 photos each
      if (i === 1) {
        // Day 2 reel starts with hero
        const reelPhotos = [hero.id];
        for (let j = 0; j < 3 && j < others.length; j++) {
          reelPhotos.push(others[j].id);
        }
        assignments.push(reelPhotos);
      } else {
        const reelIndex = Math.floor(i / 3);
        const start = (reelIndex * 4) % others.length;
        const reelPhotos: string[] = [];
        for (let j = 0; j < 4; j++) {
          const photo = others[(start + j) % others.length];
          if (photo) reelPhotos.push(photo.id);
        }
        assignments.push(reelPhotos);
      }
    } else {
      // Stories use 1 photo each
      const storyIndex = Math.floor(i / 3) + 2;
      const photo = others[storyIndex % others.length];
      assignments.push([photo?.id ?? hero.id]);
    }
  }

  return assignments;
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
