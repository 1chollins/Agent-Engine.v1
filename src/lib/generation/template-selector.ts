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

/**
 * Seeded template selection — deterministic per listing, evenly
 * distributed across variants (replaces Math.random, which had a
 * selection bias and made retries non-reproducible).
 *
 * Day 2 always gets the Just Listed hero reel. Other reel/story days
 * rotate through the variant lists, offset by a listing-derived hash so
 * different listings start at different variants.
 */
export function selectTemplate(params: {
  contentType: "reel" | "story";
  dayNumber: number;
  listingId: string;
}): CompositionTemplateKey {
  const { contentType, dayNumber, listingId } = params;

  validateDayAndType(contentType, dayNumber);

  if (contentType === "reel") {
    if (dayNumber === 2) return "day1_just_listed";
    const dayIndex = (REEL_DAYS as readonly number[]).indexOf(dayNumber);
    return REEL_VARIANT_KEYS[
      (hashString(listingId) + dayIndex) % REEL_VARIANT_KEYS.length
    ];
  }

  const dayIndex = (STORY_DAYS as readonly number[]).indexOf(dayNumber);
  return STORY_VARIANT_KEYS[
    (hashString(listingId) + dayIndex) % STORY_VARIANT_KEYS.length
  ];
}

export function getPhotoCountForTemplate(key: CompositionTemplateKey): number {
  return COMPOSITION_DEFS[key].photoCount;
}
