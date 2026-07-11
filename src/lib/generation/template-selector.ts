import {
  COMPOSITION_DEFS,
  REEL_VARIANT_KEYS,
  STORY_VARIANT_KEYS,
  hashString,
} from "./composition-map";
import type { CompositionTemplateKey } from "./composition-map";

const REEL_DAYS = [2, 5, 8, 11, 14] as const;
const STORY_DAYS = [3, 6, 9, 12] as const;

function validateDayAndType(contentType: "reel" | "story", dayNumber: number): void {
  if (contentType === "reel" && !(REEL_DAYS as readonly number[]).includes(dayNumber)) {
    throw new Error(
      `Invalid reel day ${dayNumber}. Valid reel days: ${REEL_DAYS.join(", ")}`
    );
  }
  if (contentType === "story" && !(STORY_DAYS as readonly number[]).includes(dayNumber)) {
    throw new Error(
      `Invalid story day ${dayNumber}. Valid story days: ${STORY_DAYS.join(", ")}`
    );
  }
}

/** Deterministic Fisher–Yates: same seed → same order, no selection bias. */
function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const a = [...items];
  let s = seed >>> 0;
  const next = () => {
    s = (s * 1664525 + 1013904223) >>> 0; // LCG (Numerical Recipes)
    return s / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Seeded template selection — deterministic per listing (idempotent
 * retries), but the day→template assignment is SHUFFLED by a
 * listing-derived seed, so no two listings put the same template on the
 * same days.
 *
 * Day 2 always gets the Just Listed hero reel (the grand reveal). The
 * beat-synced "AutoCut" flagship ships in every package but lands on a
 * random remaining reel day; the other reel days draw from a shuffle of
 * the classic variants. Story days draw from a shuffle of story variants.
 */
export function selectTemplate(params: {
  contentType: "reel" | "story";
  dayNumber: number;
  listingId: string;
}): CompositionTemplateKey {
  const { contentType, dayNumber, listingId } = params;

  validateDayAndType(contentType, dayNumber);

  const seed = hashString(listingId);

  if (contentType === "reel") {
    if (dayNumber === 2) return "day1_just_listed";
    const laterDays = (REEL_DAYS as readonly number[]).filter((d) => d !== 2);
    // Beat-synced claims one seeded slot among the later reel days.
    const beatDay = laterDays[seed % laterDays.length];
    if (dayNumber === beatDay) return "reel_beat_synced";
    const rotation = seededShuffle(
      REEL_VARIANT_KEYS.filter((k) => k !== "reel_beat_synced"),
      seed
    );
    const slot = laterDays.filter((d) => d !== beatDay).indexOf(dayNumber);
    return rotation[slot % rotation.length];
  }

  const shuffled = seededShuffle(STORY_VARIANT_KEYS, seed ^ 0x9e3779b9);
  const dayIndex = (STORY_DAYS as readonly number[]).indexOf(dayNumber);
  return shuffled[dayIndex % shuffled.length];
}

export function getPhotoCountForTemplate(key: CompositionTemplateKey): number {
  return COMPOSITION_DEFS[key].photoCount;
}
