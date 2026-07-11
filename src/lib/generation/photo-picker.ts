import { CONTENT_CALENDAR } from "@/types/content";
import type { ListingPhoto, ContentTag } from "@/types/listing";

type PhotoPickerOptions = {
  photoCounts: Record<number, number>;
  verticalHeroId: string | null;
};

/**
 * Smart casting: preferred content tags per slot, in priority order.
 * The picker satisfies these WITHIN the existing orientation and reuse
 * rules — a preference never overrides a hard constraint, and untagged
 * photos behave exactly as before (fallback scan in sort order).
 */

// Post themes by day (mirrors POST_THEMES order in captions.ts):
// day 4 Lifestyle, day 7 Feature Spotlight, day 10 Neighborhood, day 13 CTA.
const POST_TAG_PREFS: Record<number, readonly ContentTag[]> = {
  4: ["pool", "exterior_back", "living_room", "view"],
  7: ["kitchen", "bathroom", "detail_shot"],
  10: ["exterior_aerial", "view", "exterior_front"],
  13: ["exterior_front", "exterior_back", "living_room"],
};

// Reels play like a tour: arrive outside, kitchen, living space,
// amenity, closing beauty shot.
const REEL_SLOT_PREFS: readonly (readonly ContentTag[])[] = [
  ["exterior_front", "exterior_aerial", "exterior_back"],
  ["kitchen", "dining_room"],
  ["living_room", "dining_room", "office"],
  ["pool", "exterior_back", "bathroom"],
  ["bedroom", "view", "detail_shot"],
];

// Stories: strong opener, heart of the home, personal spaces.
const STORY_SLOT_PREFS: readonly (readonly ContentTag[])[] = [
  ["exterior_front", "pool", "exterior_aerial"],
  ["kitchen", "living_room"],
  ["bedroom", "bathroom", "view"],
  ["dining_room", "exterior_back", "detail_shot"],
];

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

  // Pick from a pool (usage < 2, not in current piece). When preferred
  // tags are given, photos matching them (in priority order) win;
  // otherwise — and as fallback — first available in sort order.
  function pickAvailable(
    pool: ListingPhoto[],
    usedInPiece: Set<string>,
    preferredTags?: readonly ContentTag[]
  ): string | null {
    const available = (photo: ListingPhoto) =>
      getUsage(photo.id) < 2 && !usedInPiece.has(photo.id);

    if (preferredTags && preferredTags.length > 0) {
      for (const tag of preferredTags) {
        for (const photo of pool) {
          if (photo.content_tag === tag && available(photo)) {
            incrementUsage(photo.id);
            usedInPiece.add(photo.id);
            return photo.id;
          }
        }
      }
    }

    for (const photo of pool) {
      if (available(photo)) {
        incrementUsage(photo.id);
        usedInPiece.add(photo.id);
        return photo.id;
      }
    }
    return null;
  }

  // Pick horizontal, fall through to square
  function pickHorizontalForPiece(
    usedInPiece: Set<string>,
    preferredTags?: readonly ContentTag[]
  ): string | null {
    return (
      pickAvailable(horizontalPool, usedInPiece, preferredTags) ??
      pickAvailable(squarePool, usedInPiece, preferredTags)
    );
  }

  // Pick vertical only
  function pickVerticalForPiece(
    usedInPiece: Set<string>,
    preferredTags?: readonly ContentTag[]
  ): string | null {
    return pickAvailable(verticalPool, usedInPiece, preferredTags);
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
    const dayNumber = CONTENT_CALENDAR[idx].day;
    const isDay2 = dayNumber === 2;
    const count = options.photoCounts[dayNumber] ?? 1;
    const verticalsNeeded = isDay2 ? count - 1 : count;
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
      const slotsRemaining = count - reelPhotos.length;
      for (let j = 0; j < slotsRemaining; j++) {
        const prefs = REEL_SLOT_PREFS[reelPhotos.length % REEL_SLOT_PREFS.length];
        reelPhotos.push(
          pickVerticalForPiece(usedInPiece, prefs) ?? horizontalHero.id
        );
      }
    } else {
      // All-horizontal reel
      if (isDay2) {
        reelPhotos.push(horizontalHero.id);
        usedInPiece.add(horizontalHero.id);
      }
      const slotsRemaining = count - reelPhotos.length;
      for (let j = 0; j < slotsRemaining; j++) {
        const prefs = REEL_SLOT_PREFS[reelPhotos.length % REEL_SLOT_PREFS.length];
        reelPhotos.push(
          pickHorizontalForPiece(usedInPiece, prefs) ?? horizontalHero.id
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
    const dayNumber = CONTENT_CALENDAR[idx].day;
    const count = options.photoCounts[dayNumber] ?? 1;
    const usedInPiece = new Set<string>();
    const storyPhotos: string[] = [];

    if (unusedVerticalsCount() >= count) {
      // All-vertical story
      for (let j = 0; j < count; j++) {
        const prefs = STORY_SLOT_PREFS[j % STORY_SLOT_PREFS.length];
        storyPhotos.push(
          pickVerticalForPiece(usedInPiece, prefs) ?? horizontalHero.id
        );
      }
    } else {
      // All-horizontal story
      for (let j = 0; j < count; j++) {
        const prefs = STORY_SLOT_PREFS[j % STORY_SLOT_PREFS.length];
        storyPhotos.push(
          pickHorizontalForPiece(usedInPiece, prefs) ?? horizontalHero.id
        );
      }
    }

    assignments[idx] = storyPhotos;
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
      const dayNumber = CONTENT_CALENDAR[idx].day;
      const usedInPiece = new Set<string>();
      assignments[idx] = [
        pickHorizontalForPiece(usedInPiece, POST_TAG_PREFS[dayNumber]) ??
          horizontalHero.id,
      ];
    }
  }

  return assignments as string[][];
}
