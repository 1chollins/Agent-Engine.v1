/**
 * Creatomate template registry.
 *
 * Each template maps to a Creatomate project template ID stored in an env var.
 * Template IDs are NOT hardcoded — they're read from environment at runtime.
 *
 * Additional template keys will be added for day2-day14 as templates are built.
 */

// Template keys — add "day2_property_tour", "day5_feature_spotlight", etc. later
export type ReelTemplateKey = "day1_just_listed";

export type ReelTemplate = {
  id: string;
  label: string;
  heroLabel: string;
  description: string;
  requiredSlots: string[];
};

const ENV_KEYS: Record<ReelTemplateKey, string> = {
  day1_just_listed: "CREATOMATE_TEMPLATE_DAY1_JUST_LISTED",
};

const TEMPLATE_DEFS: Record<
  ReelTemplateKey,
  Omit<ReelTemplate, "id">
> = {
  day1_just_listed: {
    label: "Just Listed — Property Stats",
    heroLabel: "Just Listed",
    description:
      "Hero reel with 5 photos, full property stats, and agent outro. Used for Day 1.",
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
};

export const REEL_TEMPLATES: Record<ReelTemplateKey, ReelTemplate> = Object.fromEntries(
  (Object.keys(TEMPLATE_DEFS) as ReelTemplateKey[]).map((key) => {
    const envKey = ENV_KEYS[key];
    const id = process.env[envKey] ?? "";
    return [key, { ...TEMPLATE_DEFS[key], id }];
  })
) as Record<ReelTemplateKey, ReelTemplate>;

export function getTemplate(key: ReelTemplateKey): ReelTemplate {
  const envKey = ENV_KEYS[key];
  const id = process.env[envKey];

  if (!id) {
    throw new Error(
      `${envKey} is not set in .env.local. Add it with your Creatomate template ID.`
    );
  }

  return { ...TEMPLATE_DEFS[key], id };
}
