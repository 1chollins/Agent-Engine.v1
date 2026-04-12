import { CONTENT_CALENDAR } from "@/types/content";
import type { ListingPhoto } from "@/types/listing";

type PhotoPickerOptions = {
  reelPhotoCount: number;
};

/**
 * Picks photos for each of the 14 content pieces, orientation-aware.
 *
 * For vertical output (reels, stories): prefer vertical → horizontal → square
 * For horizontal/square output (posts): prefer horizontal → square → vertical
 * Hero always goes to Day 1 post and Day 2 reel regardless of orientation.
 *
 * Each photo is used at most once across all 14 pieces (fall-through).
 * When all photos are exhausted, hero.id is used as the last-resort fallback.
 *
 * Returns string[][] — one array of photo IDs per content piece (14 total).
 */
export function pickPhotosForPackage(
  photos: ListingPhoto[],
  options: PhotoPickerOptions
): string[][] {
  if (photos.length === 0) return Array(14).fill([]);

  const hero = photos.find((p) => p.is_hero) ?? photos[0];
  const others = photos.filter((p) => p.id !== hero.id);

  // Split non-hero photos into orientation buckets (preserving sort_order)
  const vertical = others.filter((p) => p.orientation === "vertical");
  const horizontal = others.filter(
    (p) => p.orientation === "horizontal" || !p.orientation
  );
  const square = others.filter((p) => p.orientation === "square");

  // Track used photo IDs to avoid repeats across all 14 pieces
  const used = new Set<string>();
  used.add(hero.id);

  const assignments: string[][] = [];

  for (let i = 0; i < 14; i++) {
    const entry = CONTENT_CALENDAR[i];

    if (entry.type === "post") {
      if (i === 0) {
        // Day 1 post always uses hero
        assignments.push([hero.id]);
      } else {
        const id = pickFromBuckets(
          [horizontal, square, vertical],
          used
        );
        assignments.push([id ?? hero.id]);
      }
    } else if (entry.type === "reel") {
      if (i === 1) {
        // Day 2 reel always starts with hero
        const reelPhotos = [hero.id];
        for (let j = 0; j < options.reelPhotoCount - 1; j++) {
          const id = pickFromBuckets(
            [vertical, horizontal, square],
            used
          );
          reelPhotos.push(id ?? hero.id);
        }
        assignments.push(reelPhotos);
      } else {
        const reelPhotos: string[] = [];
        for (let j = 0; j < options.reelPhotoCount; j++) {
          const id = pickFromBuckets(
            [vertical, horizontal, square],
            used
          );
          reelPhotos.push(id ?? hero.id);
        }
        assignments.push(reelPhotos);
      }
    } else {
      // story
      const id = pickFromBuckets(
        [vertical, horizontal, square],
        used
      );
      assignments.push([id ?? hero.id]);
    }
  }

  return assignments;
}

/**
 * Pick the first unused photo from an ordered list of bucket preferences.
 * Each photo is used at most once — once picked, it's added to the used set.
 * Returns null if every photo in every bucket is already used.
 */
function pickFromBuckets(
  buckets: ListingPhoto[][],
  used: Set<string>
): string | null {
  for (const bucket of buckets) {
    for (const photo of bucket) {
      if (!used.has(photo.id)) {
        used.add(photo.id);
        return photo.id;
      }
    }
  }
  return null;
}
