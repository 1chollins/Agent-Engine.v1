/**
 * Composition registry for Remotion Lambda renders.
 * Replaces creatomate-templates.ts + the modification builders in
 * creatomate.ts as the source of truth for video pieces.
 *
 * template_key values are stored on content_pieces rows. The original
 * four keys are preserved; two new variant keys were added for organic
 * variety (schema-compatible with their base compositions).
 *
 * Type-only imports from remotion/ keep prop shapes in sync with the
 * compositions without pulling React code into the server bundle.
 */
import type { createServiceClient } from "@/lib/supabase/server";
import type { TripleSlideStoryProps } from "../../../remotion/compositions/TripleSlideStory";
import type { SimpleShowcaseReelProps } from "../../../remotion/compositions/SimpleShowcaseReel";
import type { FourSceneStoryProps } from "../../../remotion/compositions/FourSceneStory";
import type { JustListedReelProps } from "../../../remotion/compositions/JustListedReel";

export type CompositionTemplateKey =
  | "day1_just_listed"
  | "reel_simple_showcase"
  | "reel_split_showcase"
  | "reel_grid_collage"
  | "reel_cinematic_pan"
  | "story_triple_slide"
  | "story_zoom_reveal"
  | "story_four_scene"
  | "story_polaroid_stack"
  | "story_split_reveal";

export const REEL_VARIANT_KEYS: CompositionTemplateKey[] = [
  "reel_simple_showcase",
  "reel_split_showcase",
  "reel_grid_collage",
  "reel_cinematic_pan",
];

export const STORY_VARIANT_KEYS: CompositionTemplateKey[] = [
  "story_triple_slide",
  "story_zoom_reveal",
  "story_four_scene",
  "story_polaroid_stack",
  "story_split_reveal",
];

type CompositionDef = {
  /** Composition ID registered in remotion/Root.tsx */
  compositionId: string;
  photoCount: number;
};

export const COMPOSITION_DEFS: Record<CompositionTemplateKey, CompositionDef> = {
  day1_just_listed: { compositionId: "JustListedReel", photoCount: 5 },
  reel_simple_showcase: { compositionId: "SimpleShowcaseReel", photoCount: 4 },
  reel_split_showcase: { compositionId: "SplitScreenShowcaseReel", photoCount: 4 },
  reel_grid_collage: { compositionId: "GridCollageReel", photoCount: 4 },
  reel_cinematic_pan: { compositionId: "CinematicPanReel", photoCount: 4 },
  story_triple_slide: { compositionId: "TripleSlideStory", photoCount: 3 },
  story_zoom_reveal: { compositionId: "ZoomRevealStory", photoCount: 3 },
  story_four_scene: { compositionId: "FourSceneStory", photoCount: 4 },
  story_polaroid_stack: { compositionId: "PolaroidStackStory", photoCount: 3 },
  story_split_reveal: { compositionId: "SplitRevealStory", photoCount: 3 },
};

export function isCompositionTemplateKey(
  key: string
): key is CompositionTemplateKey {
  return key in COMPOSITION_DEFS;
}

/**
 * Deterministic 32-bit seed from a piece ID. Same piece always renders
 * identically (Inngest retries are idempotent); different pieces in a
 * package get different pans/transitions/music.
 */
export function seedFromPieceId(pieceId: string): number {
  let h = 0;
  for (let i = 0; i < pieceId.length; i++) {
    h = (h * 31 + pieceId.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Simple deterministic hash for listing-level variant selection. */
export function hashString(input: string): number {
  return seedFromPieceId(input);
}

type InputPropsArgs = {
  templateKey: CompositionTemplateKey;
  photoUrls: string[];
  listing: Record<string, unknown>;
  brand: Record<string, unknown> | null;
  seed: number;
  supabase: ReturnType<typeof createServiceClient>;
};

/**
 * Builds the composition's inputProps from listing/brand data.
 * Mirrors the field mapping of the old Creatomate modification builders.
 */
export async function buildCompositionInputProps(
  args: InputPropsArgs
): Promise<Record<string, unknown>> {
  const { templateKey, photoUrls, listing, brand, seed, supabase } = args;

  const expected = COMPOSITION_DEFS[templateKey].photoCount;
  if (photoUrls.length !== expected) {
    throw new Error(
      `${templateKey} requires exactly ${expected} photo URLs, got ${photoUrls.length}`
    );
  }

  switch (templateKey) {
    case "day1_just_listed": {
      const price = listing.price as number;
      const beds = listing.bedrooms as number | null;
      const baths = listing.bathrooms as number | null;
      const sqft = listing.sqft as number | null;
      const lotSize = listing.lot_size as string | null;
      const yearBuilt = listing.year_built as number | null;

      const details1: string[] = [];
      if (beds != null) details1.push(`${beds} Beds`);
      if (baths != null) details1.push(`${baths} Baths`);
      if (sqft != null) details1.push(`${sqft.toLocaleString()} sqft`);

      const details2: string[] = [`$${price.toLocaleString()}`];
      if (lotSize) details2.push(lotSize);
      if (yearBuilt) details2.push(`Built ${yearBuilt}`);

      const props: JustListedReelProps = {
        heroLabel: "Just Listed",
        addressLine1: listing.address as string,
        addressLine2: `${listing.city}, ${listing.state} ${listing.zip_code}`,
        details1,
        details2,
        photoUrls,
        agentName: (brand?.agent_name as string) ?? "",
        brandName: (brand?.brokerage_name as string) ?? "",
        phone: (brand?.phone as string) ?? "",
        email: (brand?.email as string) ?? "",
        agentHeadshotUrl: await getBrandAssetUrl(
          supabase,
          brand?.headshot_path as string | null
        ),
        seed,
      };
      return props;
    }

    case "reel_simple_showcase":
    case "reel_split_showcase":
    case "reel_grid_collage":
    case "reel_cinematic_pan": {
      const props: SimpleShowcaseReelProps = {
        photoUrls,
        brandName: (brand?.brokerage_name as string) ?? "",
        brandLogoUrl: await getBrandAssetUrl(
          supabase,
          brand?.logo_path as string | null
        ),
        website: (brand?.website as string | null) ?? null,
        seed,
      };
      return props;
    }

    case "story_triple_slide":
    case "story_zoom_reveal":
    case "story_polaroid_stack":
    case "story_split_reveal": {
      const props: TripleSlideStoryProps = {
        photoUrls,
        city: (listing.city as string) ?? "",
        state: (listing.state as string) ?? "",
        seed,
      };
      return props;
    }

    case "story_four_scene": {
      const props: FourSceneStoryProps = {
        photoUrls,
        city: (listing.city as string) ?? "",
        beds: (listing.bedrooms as number) ?? 0,
        baths: (listing.bathrooms as number) ?? 0,
        sqft: (listing.sqft as number | null) ?? null,
        address: (listing.address as string) ?? "",
        website: (brand?.website as string | null) ?? null,
        seed,
      };
      return props;
    }
  }
}

async function getBrandAssetUrl(
  supabase: ReturnType<typeof createServiceClient>,
  path: string | null
): Promise<string> {
  if (!path) return "";
  const { data } = await supabase.storage
    .from("brand-assets")
    .createSignedUrl(path, 3600);
  return data?.signedUrl ?? "";
}
