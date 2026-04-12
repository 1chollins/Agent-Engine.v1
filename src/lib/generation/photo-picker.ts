import { CONTENT_CALENDAR } from "@/types/content";
import type { ListingPhoto } from "@/types/listing";

type PhotoPickerOptions = {
  reelPhotoCount: number;
  verticalHeroId: string | null;
};

/**
 * Picks photos for each of the 14 content pieces, orientation-homogeneous.
 *
 * Rules (from docs/v1.1-hybrid-photos-spec.md Phase 1 Step 6):
 * - Posts: horizontal/square only. Day 1 uses horizontal hero.
 * - Reels: entirely vertical OR entirely horizontal per reel.
 *   Day 2 reel goes all-vertical if enough unused verticals available.
 *   Other reels: all-vertical if >= 5 unused verticals, else all-horizontal.
 * - Stories: vertical if >= 1 unused vertical, else horizontal.
 * - Priority: reels consume verticals before stories.
 * - Reuse: each photo used at most 2x across the package, never 2x in same piece.
 *
 * Processing order: Day 2 reel → remaining reels → stories → posts (except Day 1).
 * Last-resort fallback to horizontalHero.id when pool has no capacity.
 *
 * Returns string[][] — one array of photo IDs per content piece (14 total).
 */
export function pickPhotosForPackage(
  photos: ListingPhoto[],
  options: PhotoPickerOptions
): string[][] {
  if (photos.length === 0) return Array(14).fill([]);

  const horizontalHero = photos.find((p) => p.is_hero) ?? photos[0];

  // Resolve vertical hero: explicit ID → first vertical by sort_order → null
  const allVerticals = photos.filter((p) => p.orientation === "vertical");
  const verticalHero = options.verticalHeroId
    ? photos.find((p) => p.id === options.verticalHeroId) ?? allVerticals[0] ?? null
    : allVerticals[0] ?? null;

  // Build orientation pools excluding both heroes
  const excludeIds = new Set<string>();
  excludeIds.add(horizontalHero.id);
  if (verticalHero) excludeIds.add(verticalHero.id);

  const verticalPool = allVerticals.filter((p) => !excludeIds.has(p.id));
  const horizontalPool = photos.filter(
    (p) =>
      !excludeIds.has(p.id) &&
      (p.orientation === "horizontal" || !p.orientation)
  );
  const squarePool = photos.filter(
    (p) => !excludeIds.has(p.id) && p.orientation === "square"
  );

  // Track usage count per photo across all 14 pieces (max 2)
  const usageCount = new Map<string, number>();
  usageCount.set(horizontalHero.id, 1);
  if (verticalHero) usageCount.set(verticalHero.id, 1);

  function getUsage(id: string): number {
    return usageCount.get(id) ?? 0;
  }

  function incrementUsage(id: string): void {
    usageCount.set(id, getUsage(id) + 1);
  }

  // Pick the first available photo from a pool (usage < 2, not in current piece)
  function pickAvailable(
    pool: ListingPhoto[],
    usedInPiece: Set<string>
  ): string | null {
    for (const photo of pool) {
      if (getUsage(photo.id) < 2 && !usedInPiece.has(photo.id)) {
        incrementUsage(photo.id);
        usedInPiece.add(photo.id);
        return photo.id;
      }
    }
    return null;
  }

  // Pick horizontal, fall through to square
  function pickHorizontalForPiece(usedInPiece: Set<string>): string | null {
    return (
      pickAvailable(horizontalPool, usedInPiece) ??
      pickAvailable(squarePool, usedInPiece)
    );
  }

  // Pick vertical only
  function pickVerticalForPiece(usedInPiece: Set<string>): string | null {
    return pickAvailable(verticalPool, usedInPiece);
  }

  // Count verticals still available (usage < 2)
  function unusedVerticalsCount(): number {
    return verticalPool.filter((p) => getUsage(p.id) < 2).length;
  }

  // Pre-allocate the 14-slot result array
  const assignments: (string[] | null)[] = Array(14).fill(null);

  // --- Phase A: Reels in priority order ---
  const reelIndices = CONTENT_CALENDAR
    .map((entry, i) => (entry.type === "reel" ? i : -1))
    .filter((i) => i >= 0);

  // Day 2 (index 1) gets first dibs, rest in calendar order
  reelIndices.sort((a, b) => (a === 1 ? -1 : b === 1 ? 1 : a - b));

  for (const idx of reelIndices) {
    const isDay2 = idx === 1;
    const verticalsNeeded = isDay2 ? 4 : 5;
    const canGoVertical =
      verticalHero !== null && unusedVerticalsCount() >= verticalsNeeded;

    const usedInPiece = new Set<string>();
    const reelPhotos: string[] = [];

    if (canGoVertical) {
      // All-vertical reel
      if (isDay2) {
        reelPhotos.push(verticalHero!.id);
        usedInPiece.add(verticalHero!.id);
      }
      const slotsRemaining = options.reelPhotoCount - reelPhotos.length;
      for (let j = 0; j < slotsRemaining; j++) {
        reelPhotos.push(
          pickVerticalForPiece(usedInPiece) ?? horizontalHero.id
        );
      }
    } else {
      // All-horizontal reel
      if (isDay2) {
        reelPhotos.push(horizontalHero.id);
        usedInPiece.add(horizontalHero.id);
      }
      const slotsRemaining = options.reelPhotoCount - reelPhotos.length;
      for (let j = 0; j < slotsRemaining; j++) {
        reelPhotos.push(
          pickHorizontalForPiece(usedInPiece) ?? horizontalHero.id
        );
      }
    }

    assignments[idx] = reelPhotos;
  }

  // --- Phase B: Stories in calendar order ---
  const storyIndices = CONTENT_CALENDAR
    .map((entry, i) => (entry.type === "story" ? i : -1))
    .filter((i) => i >= 0);

  for (const idx of storyIndices) {
    const usedInPiece = new Set<string>();
    if (unusedVerticalsCount() >= 1) {
      assignments[idx] = [
        pickVerticalForPiece(usedInPiece) ?? horizontalHero.id,
      ];
    } else {
      assignments[idx] = [
        pickHorizontalForPiece(usedInPiece) ?? horizontalHero.id,
      ];
    }
  }

  // --- Phase C: Posts in calendar order ---
  const postIndices = CONTENT_CALENDAR
    .map((entry, i) => (entry.type === "post" ? i : -1))
    .filter((i) => i >= 0);

  for (const idx of postIndices) {
    if (idx === 0) {
      // Day 1 post always uses horizontal hero
      assignments[idx] = [horizontalHero.id];
    } else {
      const usedInPiece = new Set<string>();
      assignments[idx] = [
        pickHorizontalForPiece(usedInPiece) ?? horizontalHero.id,
      ];
    }
  }

  return assignments as string[][];
}
