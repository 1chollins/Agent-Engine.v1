import { Client } from "creatomate";
import { createServiceClient } from "@/lib/supabase/server";
import { getTemplate } from "./creatomate-templates";
import type { ContentTemplateKey } from "./creatomate-templates";

function getCreatomateClient(): Client {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "CREATOMATE_API_KEY is not set in .env.local. Get your key from https://creatomate.com/dashboard"
    );
  }
  return new Client(apiKey);
}

type RenderReelParams = {
  templateKey: ContentTemplateKey;
  modifications: Record<string, string>;
  listingId?: string;
  waitForCompletion?: boolean;
};

type RenderReelResult = {
  url: string;
  duration: number | undefined;
  width: number | undefined;
  height: number | undefined;
  snapshotUrl: string | undefined;
};

export async function renderReel(
  params: RenderReelParams
): Promise<RenderReelResult> {
  const { templateKey, modifications, listingId, waitForCompletion = true } = params;

  const template = getTemplate(templateKey);

  // Validate all required slots are present in modifications
  const missingSlots: string[] = [];
  for (const slot of template.requiredSlots) {
    const hasSource = `${slot}.source` in modifications;
    const hasText = `${slot}.text` in modifications;
    if (!hasSource && !hasText) {
      missingSlots.push(slot);
    }
  }

  if (missingSlots.length > 0) {
    throw new Error(
      `Missing required template slots for "${template.label}": ${missingSlots.join(", ")}. ` +
      `Each slot needs a ".source" or ".text" key in modifications.`
    );
  }

  const client = getCreatomateClient();
  const startTime = Date.now();

  const renders = waitForCompletion
    ? await client.render({ templateId: template.id, modifications })
    : await client.startRender({ templateId: template.id, modifications });

  const result = renders[0];
  if (!result) {
    throw new Error("Creatomate returned no render results");
  }

  if (result.status === "failed") {
    throw new Error(`Creatomate render failed: ${result.errorMessage ?? "Unknown error"}`);
  }

  const elapsed = Date.now() - startTime;

  // Log cost
  if (listingId) {
    try {
      const supabase = createServiceClient();
      // Using "transloadit" service enum until schema is updated to include "creatomate"
      await supabase.from("cost_logs").insert({
        listing_id: listingId,
        service: "transloadit",
        endpoint: `creatomate:render_reel:${templateKey}`,
        cost_usd: 0.30,
        response_time_ms: elapsed,
        success: true,
      });
    } catch (logErr) {
      console.error("Failed to log Creatomate cost:", logErr);
    }
  }

  return {
    url: result.url,
    duration: result.duration,
    width: result.width,
    height: result.height,
    snapshotUrl: result.snapshotUrl,
  };
}

type JustListedParams = {
  heroLabel: string;
  addressLine1: string;
  addressLine2: string;
  details1: string[];
  details2: string[];
  photoUrls: string[];
  agentName: string;
  brandName: string;
  phone: string;
  email: string;
  agentHeadshotUrl: string;
};

export function buildJustListedModifications(
  params: JustListedParams
): Record<string, string> {
  const {
    heroLabel,
    addressLine1,
    addressLine2,
    details1,
    details2,
    photoUrls,
    agentName,
    brandName,
    phone,
    email,
    agentHeadshotUrl,
  } = params;

  if (photoUrls.length !== 5) {
    throw new Error(
      `buildJustListedModifications requires exactly 5 photo URLs, got ${photoUrls.length}`
    );
  }

  return {
    "Text.text": heroLabel,
    "Address.text": `${addressLine1},\n${addressLine2}`,
    "Details-1.text": details1.join("\n"),
    "Details-2.text": details2.join("\n"),
    "Photo-1.source": photoUrls[0],
    "Photo-2.source": photoUrls[1],
    "Photo-3.source": photoUrls[2],
    "Photo-4.source": photoUrls[3],
    "Photo-5.source": photoUrls[4],
    "Name.text": agentName,
    "Brand-Name.text": brandName,
    "Phone-Number.text": phone,
    "Email.text": email,
    "Picture.source": agentHeadshotUrl,
  };
}

type TripleSlideStoryParams = {
  photoUrls: string[];
  city: string;
  state: string;
};

export function buildTripleSlideStoryModifications(
  params: TripleSlideStoryParams
): Record<string, string> {
  const { photoUrls, city, state } = params;

  if (photoUrls.length !== 3) {
    throw new Error(
      `buildTripleSlideStoryModifications requires exactly 3 photo URLs, got ${photoUrls.length}`
    );
  }

  return {
    "Image-1.source": photoUrls[0],
    "Image-2.source": photoUrls[1],
    "Image-3.source": photoUrls[2],
    "Text.text": `${city}, ${state}`,
  };
}
