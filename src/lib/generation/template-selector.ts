import { CONTENT_TEMPLATES } from "./creatomate-templates";
import type { ContentTemplateKey } from "./creatomate-templates";

const REEL_DAYS = [2, 5, 8, 11, 14] as const;
const STORY_DAYS = [3, 6, 9, 12] as const;

const STORY_TEMPLATES: ContentTemplateKey[] = [
  "story_triple_slide",
  "story_four_scene",
];

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

export function selectTemplate(params: {
  contentType: "reel" | "story";
  dayNumber: number;
}): ContentTemplateKey {
  const { contentType, dayNumber } = params;

  validateDayAndType(contentType, dayNumber);

  if (contentType === "reel") {
    if (dayNumber === 2) return "day1_just_listed";
    return "reel_simple_showcase";
  }

  // Story: random selection
  const index = Math.floor(Math.random() * STORY_TEMPLATES.length);
  return STORY_TEMPLATES[index];
}

export function getPhotoCountForTemplate(key: ContentTemplateKey): number {
  return CONTENT_TEMPLATES[key].photoCount;
}
