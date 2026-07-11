import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CONTENT_TAGS, type ContentTag } from "@/types/listing";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

const MODEL = "claude-haiku-4-5-20251001";
const INPUT_COST_PER_MILLION = 0.80;
const OUTPUT_COST_PER_MILLION = 4.00;

const PROMPT = `You are tagging a real estate property photo. Respond with EXACTLY one of these tags, lowercase, no punctuation, no other words:

kitchen, bathroom, bedroom, living_room, dining_room, exterior_front, exterior_back, exterior_aerial, pool, garage, office, closet, hallway, detail_shot, view, other

Tag guide:
- exterior_front: street-facing front of the home
- exterior_back: rear yard, backyard, patio
- exterior_aerial: drone or top-down shot
- detail_shot: close-up of fixtures, finishes, hardware, decor
- view: a vista or scenery shot from the property
- other: anything that does not fit the categories above

Return ONLY the tag.`;

function normalizeTag(raw: string): ContentTag {
  const cleaned = raw.trim().toLowerCase().replace(/[^a-z_]/g, "");
  return (CONTENT_TAGS as readonly string[]).includes(cleaned)
    ? (cleaned as ContentTag)
    : "other";
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
}): Promise<{
  tag: ContentTag;
  rawResponse: string;
  cost: number;
  elapsedMs: number;
}> {
  const { imageBuffer, supabase, listingId } = params;

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
          { type: "text", text: PROMPT },
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

  const tag = normalizeTag(rawResponse);

  return { tag, rawResponse, cost, elapsedMs };
}
