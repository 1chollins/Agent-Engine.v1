import { Client } from "creatomate";
import { createServiceClient } from "@/lib/supabase/server";
import { getPhotoSignedUrls } from "./video-clips";
import { getTemplate } from "./creatomate-templates";
import type { ContentTemplateKey } from "./creatomate-templates";
import {
  buildJustListedModifications,
  buildSimpleShowcaseReelModifications,
} from "./creatomate";
import type { ContentPiece } from "@/types/content";

function getCreatomateClient(): Client {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) {
    throw new Error("CREATOMATE_API_KEY is not set in .env.local");
  }
  return new Client(apiKey);
}

type StartReelResult = {
  renderId: string;
  pieceId: string;
  userId: string;
  templateKey: string;
};

/**
 * Starts a Creatomate render for a single reel content piece.
 * Does NOT wait for completion — returns a render ID for polling.
 */
export async function startReelRender(
  listingId: string,
  packageId: string,
  dayNumber: number
): Promise<StartReelResult> {
  const supabase = createServiceClient();

  const { data: piece } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("package_id", packageId)
    .eq("day_number", dayNumber)
    .eq("content_type", "reel")
    .single();

  if (!piece) {
    throw new Error(`No reel piece found for day ${dayNumber}`);
  }

  const typedPiece = piece as ContentPiece;
  const templateKey = typedPiece.template_key;

  if (!templateKey) {
    await markPieceFailed(typedPiece.id, `No template_key set on reel piece for day ${dayNumber}`);
    throw new Error(`No template_key set on reel piece for day ${dayNumber}`);
  }

  try {
    const { data: listing } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (!listing) {
      throw new Error("Listing not found");
    }

    const ls = listing as Record<string, unknown>;
    const userId = ls.user_id as string;

    const { data: brand } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Mark piece as processing
    await supabase
      .from("content_pieces")
      .update({ status: "processing" })
      .eq("id", typedPiece.id);

    const photoIds = typedPiece.source_photo_ids ?? [];
    if (photoIds.length === 0) {
      throw new Error("No photos assigned to this reel");
    }

    const photoUrls = await getPhotoSignedUrls(listingId, photoIds);
    if (photoUrls.length === 0) {
      throw new Error("Could not get signed URLs for photos");
    }

    // Build modifications based on template
    const modifications = await buildModificationsForTemplate(
      templateKey as ContentTemplateKey,
      photoUrls,
      ls,
      brand as Record<string, unknown> | null,
      supabase
    );

    // Start render (non-blocking)
    const template = getTemplate(templateKey as ContentTemplateKey);
    const client = getCreatomateClient();
    const renders = await client.startRender({
      templateId: template.id,
      modifications,
    });

    const render = renders[0];
    if (!render) {
      throw new Error("Creatomate returned no render results");
    }

    return {
      renderId: render.id,
      pieceId: typedPiece.id,
      userId,
      templateKey,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await markPieceFailed(typedPiece.id, message);
    throw err;
  }
}

type PollResult = {
  status: "rendering" | "succeeded" | "failed";
  url?: string;
  errorMessage?: string;
};

/**
 * Checks the status of a Creatomate render by ID.
 * Returns a simplified status for the polling loop.
 */
export async function checkReelRenderStatus(
  renderId: string
): Promise<PollResult> {
  const client = getCreatomateClient();
  const render = await client.fetchRender(renderId);

  if (render.status === "succeeded") {
    return { status: "succeeded", url: render.url };
  }

  if (render.status === "failed") {
    return {
      status: "failed",
      errorMessage: render.errorMessage ?? "Unknown render error",
    };
  }

  // Still planned, waiting, transcribing, or rendering
  return { status: "rendering" };
}

type FinalizeParams = {
  renderUrl: string;
  pieceId: string;
  listingId: string;
  userId: string;
  dayNumber: number;
  templateKey: string;
};

/**
 * Downloads the rendered mp4 from Creatomate, uploads to Supabase Storage
 * at the expected asset path, logs cost, and marks the piece complete.
 */
export async function finalizeReelRender(
  params: FinalizeParams
): Promise<{ succeeded: true }> {
  const { renderUrl, pieceId, listingId, userId, dayNumber, templateKey } =
    params;
  const supabase = createServiceClient();

  // Download mp4 from Creatomate CDN
  const response = await fetch(renderUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download from Creatomate: ${response.status}`
    );
  }
  const buffer = Buffer.from(await response.arrayBuffer());

  // Upload to Supabase at the path downstream UI/download code expects
  const assetPath = `${userId}/${listingId}/reels/day-${dayNumber}.mp4`;
  const { error: uploadError } = await supabase.storage
    .from("generated-content")
    .upload(assetPath, buffer, { contentType: "video/mp4", upsert: true });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  // Log cost (only on success — Creatomate doesn't bill failed renders)
  try {
    await supabase.from("cost_logs").insert({
      listing_id: listingId,
      content_piece_id: pieceId,
      service: "creatomate",
      endpoint: `creatomate:render_reel:${templateKey}`,
      cost_usd: 0.30,
      response_time_ms: null,
      success: true,
    });
  } catch (logErr) {
    console.error("Failed to log Creatomate cost:", logErr);
  }

  // Mark piece complete
  await supabase
    .from("content_pieces")
    .update({
      asset_path: assetPath,
      asset_type: "video",
      status: "complete",
      generated_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", pieceId);

  return { succeeded: true };
}

/**
 * Marks a content piece as failed with an error message.
 */
export async function markPieceFailed(
  pieceId: string,
  errorMessage: string
): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("content_pieces")
    .update({
      status: "failed",
      error_message: `Video generation failed: ${errorMessage}`,
    })
    .eq("id", pieceId);
}

// ---------------------------------------------------------------------------
// Template → modifications builder dispatch
// ---------------------------------------------------------------------------

async function buildModificationsForTemplate(
  templateKey: ContentTemplateKey,
  photoUrls: string[],
  listing: Record<string, unknown>,
  brand: Record<string, unknown> | null,
  supabase: ReturnType<typeof createServiceClient>
): Promise<Record<string, string>> {
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

      const details2: string[] = [];
      details2.push(`$${price.toLocaleString()}`);
      if (lotSize) details2.push(lotSize);
      if (yearBuilt) details2.push(`Built ${yearBuilt}`);

      return buildJustListedModifications({
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
      });
    }

    case "reel_simple_showcase": {
      return buildSimpleShowcaseReelModifications({
        photoUrls,
        brandName: (brand?.brokerage_name as string) ?? "",
        brandLogoUrl: await getBrandAssetUrl(
          supabase,
          brand?.logo_path as string | null
        ),
        website: (brand?.website as string | null) ?? null,
      });
    }

    default:
      throw new Error(`No reel builder for template: ${templateKey}`);
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
