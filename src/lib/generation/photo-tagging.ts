import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getPropertyClass,
  getTagsForPropertyClass,
  type ContentTag,
  type PropertyClass,
  type PropertyType,
} from "@/types/listing";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

const MODEL = "claude-haiku-4-5-20251001";
const INPUT_COST_PER_MILLION = 0.80;
const OUTPUT_COST_PER_MILLION = 4.00;

/**
 * Per-class hints for the ambiguous tags. Only the tags that are genuinely
 * confusable need a line here — listing all of them just burns input tokens.
 */
const TAG_GUIDES: Record<PropertyClass, string> = {
  residential: `- exterior_front: street-facing front of the home
- exterior_back: rear yard, backyard, patio
- exterior_aerial: drone or top-down shot
- detail_shot: close-up of fixtures, finishes, hardware, decor
- view: a vista or scenery shot from the property`,
  multifamily: `- unit_interior: inside an individual unit, where the room type is unclear
- kitchen / bathroom / bedroom / living_room: inside a unit, where the room type is clear
- common_area: shared indoor space that is not the lobby
- building_exterior: the building itself from outside
- exterior_aerial: drone or top-down shot`,
  commercial: `- lobby: main entry space inside the building
- reception: a staffed desk or check-in point
- office_suite: open or private workspace
- retail_floor: sales floor with fixtures or merchandise
- storefront: the shop entrance seen from outside
- building_exterior: the building itself from outside
- signage: close-up where signage or lettering is the subject
- common_area: shared indoor space that is not the lobby
- exterior_aerial: drone or top-down shot`,
  land: `- parcel: the land itself, usually from above
- frontage: the boundary along a road or property line
- road_access: the access road or entry point
- water_frontage: shoreline, canal, lake, or river edge
- exterior_aerial: drone or top-down shot of the site`,
};

function buildPrompt(cls: PropertyClass): string {
  const tags = getTagsForPropertyClass(cls);
  return `You are tagging a photo of a ${cls === "land" ? "land parcel" : `${cls} property`}. Respond with EXACTLY one of these tags, lowercase, no punctuation, no other words:

${tags.join(", ")}

Tag guide:
${TAG_GUIDES[cls]}
- detail_shot: close-up of a fixture, finish, or material
- other: anything that does not fit the categories above

Return ONLY the tag.`;
}

/**
 * Only accepts tags valid for this property class. A model answer of "bedroom"
 * on a warehouse photo is rejected to "other" rather than stored, which stops
 * a residential camera move being applied to a commercial space.
 */
function normalizeTag(raw: string, cls: PropertyClass): ContentTag {
  const cleaned = raw.trim().toLowerCase().replace(/[^a-z_]/g, "");
  const allowed = getTagsForPropertyClass(cls) as readonly string[];
  return allowed.includes(cleaned) ? (cleaned as ContentTag) : "other";
}

/**
 * Tags every untagged photo on a listing (generation-time safety net —
 * the upload-time fire-and-forget tagging is best-effort only).
 * Runs downloads+classification in small concurrent batches. Errors on
 * individual photos are logged and skipped; the picker treats untagged
 * photos as neutral, so partial tagging degrades gracefully.
 */
export async function tagUntaggedListingPhotos(
  listingId: string,
  supabase: SupabaseClient
): Promise<{ tagged: number; failed: number; skipped: number }> {
  // The tag vocabulary depends on what kind of property this is, so the type
  // has to be read before any photo is classified.
  const { data: listingRow } = await supabase
    .from("listings")
    .select("property_type")
    .eq("id", listingId)
    .single();
  const propertyType = (listingRow?.property_type ??
    "single_family") as PropertyType;

  const { data: photos } = await supabase
    .from("listing_photos")
    .select("id, file_path, content_tag")
    .eq("listing_id", listingId);

  const untagged = (photos ?? []).filter((p) => !p.content_tag);
  const skipped = (photos ?? []).length - untagged.length;
  let tagged = 0;
  let failed = 0;

  const BATCH = 6;
  for (let i = 0; i < untagged.length; i += BATCH) {
    const batch = untagged.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (photo) => {
        const { data: fileData, error: downloadErr } = await supabase.storage
          .from("listing-photos")
          .download(photo.file_path);
        if (downloadErr || !fileData) {
          throw new Error(`download failed: ${downloadErr?.message}`);
        }
        const buffer = Buffer.from(await fileData.arrayBuffer());
        const { tag } = await classifyPhoto({
          imageBuffer: buffer,
          supabase,
          listingId,
          propertyType,
        });
        await supabase
          .from("listing_photos")
          .update({ content_tag: tag })
          .eq("id", photo.id);
      })
    );
    for (const r of results) {
      if (r.status === "fulfilled") tagged++;
      else {
        failed++;
        console.error("[photo-tagging] batch item failed:", r.reason);
      }
    }
  }

  return { tagged, failed, skipped };
}

export async function classifyPhoto(params: {
  imageBuffer: Buffer;
  supabase: SupabaseClient;
  listingId: string;
  /** Defaults to residential so existing callers keep their behaviour. */
  propertyType?: PropertyType;
}): Promise<{
  tag: ContentTag;
  rawResponse: string;
  cost: number;
  elapsedMs: number;
}> {
  const { imageBuffer, supabase, listingId, propertyType } = params;
  const propertyClass: PropertyClass = propertyType
    ? getPropertyClass(propertyType)
    : "residential";

  const resizedBuffer = await sharp(imageBuffer)
    .resize(512, 512, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const base64 = resizedBuffer.toString("base64");

  const startTime = Date.now();
  const response = await getAnthropicClient().messages.create({
    model: MODEL,
    max_tokens: 20,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64,
            },
          },
          { type: "text", text: buildPrompt(propertyClass) },
        ],
      },
    ],
  });
  const elapsedMs = Date.now() - startTime;

  const rawResponse =
    response.content[0]?.type === "text" ? response.content[0].text : "";

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cost =
    (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION +
    (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;

  await supabase.from("cost_logs").insert({
    listing_id: listingId,
    service: "claude",
    endpoint: "messages.create:photo-tagging",
    cost_usd: cost,
    response_time_ms: elapsedMs,
    success: true,
  });

  const tag = normalizeTag(rawResponse, propertyClass);

  return { tag, rawResponse, cost, elapsedMs };
}
