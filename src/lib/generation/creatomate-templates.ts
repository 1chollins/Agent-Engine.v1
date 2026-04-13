/**
 * Creatomate template registry.
 *
 * Each template maps to a Creatomate project template ID stored in an env var.
 * Template IDs are NOT hardcoded — they're read from environment at runtime.
 *
 * Additional template keys will be added for day2-day14 as templates are built.
 */

// Template keys — add new templates as they're designed in Creatomate
export type ContentTemplateKey = "day1_just_listed" | "story_triple_slide" | "reel_simple_showcase";

export type ContentTemplate = {
  id: string;
  label: string;
  heroLabel: string;
  description: string;
  requiredSlots: string[];
  templateType: "reel" | "story";
  photoCount: number;
  aspectRatio: string;
  duration: number;
};

const ENV_KEYS: Record<ContentTemplateKey, string> = {
  day1_just_listed: "CREATOMATE_TEMPLATE_DAY1_JUST_LISTED",
  story_triple_slide: "CREATOMATE_TEMPLATE_STORY_TRIPLE_SLIDE",
  reel_simple_showcase: "CREATOMATE_TEMPLATE_REEL_SIMPLE_SHOWCASE",
};

const TEMPLATE_DEFS: Record<
  ContentTemplateKey,
  Omit<ContentTemplate, "id">
> = {
  day1_just_listed: {
    label: "Just Listed — Property Stats",
    heroLabel: "Just Listed",
    description:
      "Hero reel with 5 photos, full property stats, and agent outro. Used for Day 1.",
    templateType: "reel",
    photoCount: 5,
    aspectRatio: "9:16",
    duration: 30,
    requiredSlots: [
      "Text",
      "Address",
      "Details-1",
      "Details-2",
      "Photo-1",
      "Photo-2",
      "Photo-3",
      "Photo-4",
      "Photo-5",
      "Name",
      "Brand-Name",
      "Phone-Number",
      "Email",
      "Picture",
    ],
  },
  story_triple_slide: {
    label: "Story — Triple Slide",
    heroLabel: "Triple Slide",
    description:
      "3-photo story with city/state text overlay. 13s duration, 9:16 vertical.",
    templateType: "story",
    photoCount: 3,
    aspectRatio: "9:16",
    duration: 13,
    requiredSlots: [
      "Image-1",
      "Image-2",
      "Image-3",
      "Text",
    ],
  },
  reel_simple_showcase: {
    label: "Reel — Simple Showcase",
    heroLabel: "Simple Showcase",
    description:
      "4-photo reel with branded overlay and website URL outro. 12s duration, 9:16 vertical.",
    templateType: "reel",
    photoCount: 4,
    aspectRatio: "9:16",
    duration: 12,
    requiredSlots: [
      "Image-1",
      "Image-2",
      "Image-3",
      "Image-4",
      "Brand-Name",
      "Brand-Logo",
      "URL",
    ],
  },
};

export const CONTENT_TEMPLATES: Record<ContentTemplateKey, ContentTemplate> = Object.fromEntries(
  (Object.keys(TEMPLATE_DEFS) as ContentTemplateKey[]).map((key) => {
    const envKey = ENV_KEYS[key];
    const id = process.env[envKey] ?? "";
    return [key, { ...TEMPLATE_DEFS[key], id }];
  })
) as Record<ContentTemplateKey, ContentTemplate>;

export function getTemplate(key: ContentTemplateKey): ContentTemplate {
  const envKey = ENV_KEYS[key];
  const id = process.env[envKey];

  if (!id) {
    throw new Error(
      `${envKey} is not set in .env.local. Add it with your Creatomate template ID.`
    );
  }

  return { ...TEMPLATE_DEFS[key], id };
}
