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
import { audienceOf, AUDIENCE_COPY, priceLabel, statLines } from "@/lib/audience";

export type CompositionTemplateKey =
  | "day1_just_listed"
  | "reel_simple_showcase"
  | "reel_split_showcase"
  | "reel_grid_collage"
  | "reel_cinematic_pan"
  | "reel_beat_synced"
  | "reel_editorial"
  | "reel_cinematic_noir"
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
  "reel_beat_synced",
  "reel_editorial",
  "reel_cinematic_noir",
];

/** The flagship styles (2026-10): every package gets both. */
export const SIGNATURE_REEL_KEYS: CompositionTemplateKey[] = [
  "reel_editorial",
  "reel_cinematic_noir",
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
  reel_beat_synced: { compositionId: "BeatSyncedShowcaseReel", photoCount: 4 },
  reel_editorial: { compositionId: "EditorialCountdownReel", photoCount: 4 },
  reel_cinematic_noir: { compositionId: "CinematicNoirReel", photoCount: 4 },
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
  /** content_pieces.text_overlay — JSON array of on-screen phrases. */
  textOverlay?: string | null;
};

function parseOverlay(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((p): p is string => typeof p === "string" && p.trim().length > 0).slice(0, 6)
      : [];
  } catch {
    return [];
  }
}

/** Agent colors + phrases + realtor/host wording shared by every reel. */
function brandExtras(brand: Record<string, unknown> | null, textOverlay?: string | null) {
  // Host campaigns swap the sale wording; realtor reels keep each style's own.
  const hostWording =
    audienceOf(brand) === "host"
      ? {
          heroLabel: "Now booking",
          priceKicker: AUDIENCE_COPY.host.priceKicker,
          ctaLine: AUDIENCE_COPY.host.ctaLine,
        }
      : {};
  return {
    primaryColor: (brand?.primary_color as string | null) ?? undefined,
    secondaryColor: (brand?.secondary_color as string | null) ?? undefined,
    accentColor: (brand?.accent_color as string | null) ?? null,
    overlayPhrases: parseOverlay(textOverlay),
    ...hostWording,
  };
}

/** Listing facts for the editorial / cinematic styles (only what was given). */
function listingFacts(listing: Record<string, unknown>, brand: Record<string, unknown> | null) {
  const audience = audienceOf(brand);
  return {
    address: (listing.address as string) ?? "",
    cityLine: [listing.city, [listing.state, listing.zip_code].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", "),
    priceLabel: priceLabel(listing.price as number | null, audience) ?? "",
    stats: statLines(listing, audience),
  };
}

/**
 * Builds the composition's inputProps from listing/brand data.
 * Mirrors the field mapping of the old Creatomate modification builders.
 */
export async function buildCompositionInputProps(
  args: InputPropsArgs
): Promise<Record<string, unknown>> {
  const { templateKey, photoUrls, listing, brand, seed, supabase, textOverlay } = args;

  const expected = COMPOSITION_DEFS[templateKey].photoCount;
  if (photoUrls.length !== expected) {
    throw new Error(
      `${templateKey} requires exactly ${expected} photo URLs, got ${photoUrls.length}`
    );
  }

  switch (templateKey) {
    case "day1_just_listed": {
      const audience = audienceOf(brand);
      const lotSize = listing.lot_size as string | null;
      const yearBuilt = listing.year_built as number | null;

      // Only facts that were filled in. A panel with nothing to say is left
      // empty and skipped by the composition.
      const details1 = statLines(listing, audience);
      const details2: string[] = [];
      const price = priceLabel(listing.price as number | null, audience);
      if (price) details2.push(price);
      if (audience === "agent" && lotSize) details2.push(lotSize);
      if (audience === "agent" && yearBuilt) details2.push(`Built ${yearBuilt}`);
      if (audience === "host" && listing.city) details2.push(String(listing.city));

      const props: JustListedReelProps = {
        heroLabel: AUDIENCE_COPY[audience].heroLabel,
        addressLine1: listing.address as string,
        addressLine2: `${listing.city}, ${listing.state} ${listing.zip_code}`,
        details1,
        details2,
        photoUrls,
        agentName: (brand?.agent_name as string) ?? "",
        brandName: (brand?.brokerage_name as string | null) ?? "",
        phone: (brand?.phone as string) ?? "",
        email: (brand?.email as string) ?? "",
        agentHeadshotUrl: await getBrandAssetUrl(
          supabase,
          brand?.headshot_path as string | null
        ),
        seed,
        ...brandExtras(brand, textOverlay),
      };
      return props;
    }

    case "reel_simple_showcase":
    case "reel_split_showcase":
    case "reel_grid_collage":
    case "reel_cinematic_pan":
    case "reel_beat_synced":
    case "reel_editorial":
    case "reel_cinematic_noir": {
      const props: SimpleShowcaseReelProps = {
        photoUrls,
        brandName: (brand?.brokerage_name as string | null) ?? "",
        brandLogoUrl: await getBrandAssetUrl(
          supabase,
          brand?.logo_path as string | null
        ),
        website: (brand?.website as string | null) ?? null,
        seed,
        ...brandExtras(brand, textOverlay),
        agentName: (brand?.agent_name as string) ?? "",
        phone: (brand?.phone as string) ?? "",
        agentHeadshotUrl: await getBrandAssetUrl(
          supabase,
          brand?.headshot_path as string | null
        ),
        ...listingFacts(listing, brand),
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
      const audience = audienceOf(brand);
      const city = (listing.city as string) ?? "";
      const stats = statLines(listing, audience);
      const props: FourSceneStoryProps = {
        photoUrls,
        city,
        beds: (listing.bedrooms as number) ?? 0,
        baths: (listing.bathrooms as number) ?? 0,
        sqft: (listing.sqft as number | null) ?? null,
        address: (listing.address as string) ?? "",
        website:
          (audience === "host" ? (brand?.booking_url as string | null) : null) ??
          (brand?.website as string | null) ??
          null,
        seed,
        headline: city
          ? `${AUDIENCE_COPY[audience].newLabel}: ${city}`
          : AUDIENCE_COPY[audience].newLabel,
        factsLine:
          stats.slice(0, 3).join(" · ") ||
          priceLabel(listing.price as number | null, audience) ||
          city,
        closingLine: audience === "host" ? "Link in bio to book" : "Link in bio for full tour",
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
