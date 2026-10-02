import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import type { ContentType } from "@/types/content";
import {
  audienceOf,
  audienceRules,
  AUDIENCE_COPY,
  brandPromptDetails,
  cityTag,
  listingPromptDetails,
  THEMES,
} from "@/lib/audience";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

const MODEL = "claude-haiku-4-5-20251001";

// Haiku pricing per 1M tokens
const INPUT_COST_PER_MILLION = 0.80;
const OUTPUT_COST_PER_MILLION = 4.00;

export type CaptionResult = {
  caption_instagram: string;
  caption_facebook: string;
  hashtags: string;
};

export type BatchCaptionResult = {
  day_number: number;
  content_type: ContentType;
  caption_instagram: string;
  caption_facebook: string;
  hashtags: string;
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: "Write in a polished, authoritative tone. Use industry terms naturally. Project competence and market expertise.",
  friendly: "Write in a warm, approachable tone. Use conversational language. Make the reader feel welcomed and excited.",
  luxury: "Write in an elevated, aspirational tone. Use sophisticated language. Emphasize exclusivity and premium quality.",
  casual: "Write in a relaxed, down-to-earth tone. Use everyday language. Keep it real and relatable.",
};

function buildListingContext(listing: Listing, brand: BrandProfile): string {
  const audience = audienceOf(brand);
  return `PROPERTY DETAILS:\n${listingPromptDetails(listing, audience)}\n\n${brandPromptDetails(brand, audience)}\n\nRULES FOR THIS PROPERTY:\n${audienceRules(listing, audience)}`;
}

export type RedoCaptionResult = CaptionResult & {
  story_teaser?: string;
  story_cta?: string;
};

/**
 * Regenerate-with-direction: rewrites ONE piece's captions, steering with
 * the user's instruction ("shorter", "highlight the lanai", "more luxury").
 * The previous captions are included so the rewrite is actually different.
 * Text-only — cheap enough to allow unlimited redos.
 */
export async function regeneratePieceCaptions(
  listing: Listing,
  brand: BrandProfile,
  piece: {
    day_number: number;
    content_type: ContentType;
    caption_instagram: string | null;
    caption_facebook: string | null;
    hashtags: string | null;
    story_teaser?: string | null;
    story_cta?: string | null;
  },
  direction: string,
  listingId: string
): Promise<RedoCaptionResult> {
  const supabase = createServiceClient();
  const context = buildListingContext(listing, brand);
  const toneGuide = TONE_INSTRUCTIONS[brand.tone] ?? TONE_INSTRUCTIONS.professional;
  const isStory = piece.content_type === "story";
  const igRange = piece.content_type === "post" ? "40–70" : "15–35";
  const fbRange = piece.content_type === "post" ? "60–90" : "30–50";

  const storyFields = isStory
    ? `,\n  "story_teaser": "<a punchy 4–8 word teaser overlay>",\n  "story_cta": "<a short call-to-action line>"`
    : "";

  const prompt = `You are a ${AUDIENCE_COPY[audienceOf(brand)].writer}. REWRITE the captions for one ${piece.content_type} in a 14-day campaign.

${context}

TONE: ${toneGuide}

THE ${AUDIENCE_COPY[audienceOf(brand)].noun.toUpperCase()}'S DIRECTION FOR THIS REWRITE (top priority — follow it exactly):
"${direction}"

PREVIOUS VERSION (write something clearly different):
Instagram: ${piece.caption_instagram ?? "(none)"}
Facebook: ${piece.caption_facebook ?? "(none)"}
${isStory ? `Story teaser: ${piece.story_teaser ?? "(none)"}\nStory CTA: ${piece.story_cta ?? "(none)"}\n` : ""}
RULES:
- BREVITY IS THE TOP PRIORITY. Instagram ${igRange} words MAX, Facebook ${fbRange} words MAX.
- Structure: hook line of 8 words or fewer, then 2–3 short punchy lines with line breaks, then a one-line CTA mentioning ${brand.agent_name}. 1–2 emojis total.
- 12–18 hashtags as a single space-separated string.
- Apply the direction above everything else, but never break the rules for this property.

Respond in this exact JSON format (ONLY the JSON, no other text):
{
  "caption_instagram": "<caption>",
  "caption_facebook": "<caption>",
  "hashtags": "<space-separated hashtags>"${storyFields}
}`;

  const startTime = Date.now();
  const response = await getAnthropicClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  const elapsed = Date.now() - startTime;

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const cost =
    (response.usage.input_tokens / 1_000_000) * INPUT_COST_PER_MILLION +
    (response.usage.output_tokens / 1_000_000) * OUTPUT_COST_PER_MILLION;

  await supabase.from("cost_logs").insert({
    listing_id: listingId,
    service: "claude",
    endpoint: "messages.create:redo-caption",
    cost_usd: cost,
    response_time_ms: elapsed,
    success: true,
  });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse caption rewrite response");
  }
  return JSON.parse(jsonMatch[0]) as RedoCaptionResult;
}

export async function generateCaptionsBatch(
  listing: Listing,
  brand: BrandProfile,
  pieces: { day_number: number; content_type: ContentType }[],
  listingId: string
): Promise<BatchCaptionResult[]> {
  const supabase = createServiceClient();
  const context = buildListingContext(listing, brand);
  const toneGuide = TONE_INSTRUCTIONS[brand.tone] ?? TONE_INSTRUCTIONS.professional;

  const themes = THEMES[audienceOf(brand)];
  const posts = pieces.filter((p) => p.content_type === "post");
  const reels = pieces.filter((p) => p.content_type === "reel");

  const results: BatchCaptionResult[] = [];

  // Generate post captions in one batch call
  if (posts.length > 0) {
    const postResults = await generateCaptionsForType(
      context,
      toneGuide,
      brand,
      listing,
      posts,
      "post",
      themes.posts,
      listingId,
      supabase
    );
    results.push(...postResults);
  }

  // Generate reel captions in one batch call
  if (reels.length > 0) {
    const reelResults = await generateCaptionsForType(
      context,
      toneGuide,
      brand,
      listing,
      reels,
      "reel",
      themes.reels,
      listingId,
      supabase
    );
    results.push(...reelResults);
  }

  return results;
}

async function generateCaptionsForType(
  context: string,
  toneGuide: string,
  brand: BrandProfile,
  listing: Listing,
  pieces: { day_number: number; content_type: ContentType }[],
  type: "post" | "reel",
  themes: readonly string[],
  listingId: string,
  supabase: ReturnType<typeof createServiceClient>
): Promise<BatchCaptionResult[]> {
  const igRange = type === "post" ? "40–70" : "15–35";
  const fbRange = type === "post" ? "60–90" : "30–50";
  const themeList = pieces
    .map((p, i) => `- Day ${p.day_number}: Theme — "${themes[i % themes.length]}"`)
    .join("\n");

  const audience = audienceOf(brand);
  const city = cityTag(listing.city);
  const hashtagHint =
    audience === "host"
      ? `#${city}VacationRental, #${city}Airbnb, destination and travel tags, amenity tags (pool, beach, etc.)`
      : `#${city}RealEstate, #${city}Homes, location-specific tags, property feature tags, and general real estate tags`;

  const prompt = `You are a ${AUDIENCE_COPY[audience].writer}. Generate ${type} captions for a 14-day content calendar.

${context}

TONE: ${toneGuide}

Generate captions for these ${pieces.length} ${type}s:
${themeList}

For EACH ${type}, output:
1. Instagram caption (${igRange} words MAX — social captions are skimmed, not read). Structure: a scroll-stopping hook line of 8 words or fewer, then 2–3 short punchy lines separated by line breaks, then a one-line call-to-action mentioning ${brand.agent_name}. 1–2 emojis total.
2. Facebook caption (${fbRange} words MAX). Same structure, slightly more detail allowed. End with a one-line call-to-action.
3. 12–18 hashtags including: ${hashtagHint}.

RULES:
- BREVITY IS THE TOP PRIORITY. Never write a dense paragraph. Short lines, line breaks between thoughts.
- Pick ONE or TWO specific details per caption (a feature, the neighborhood, the price if given) — do not list everything
- Each caption must be UNIQUE — different angle, different opening line, different CTA
- Never start two captions the same way
- Include the ${AUDIENCE_COPY[audience].noun}'s contact info (or booking link) naturally in the CTA
- Hashtags should be a single string separated by spaces

Respond in this exact JSON format:
[
  {
    "day_number": <number>,
    "caption_instagram": "<caption>",
    "caption_facebook": "<caption>",
    "hashtags": "<space-separated hashtags>"
  }
]

Return ONLY the JSON array, no other text.`;

  const startTime = Date.now();
  const response = await getAnthropicClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  const elapsed = Date.now() - startTime;

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Log cost
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cost =
    (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION +
    (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;

  await supabase.from("cost_logs").insert({
    listing_id: listingId,
    service: "claude",
    endpoint: `messages.create:${type}-captions`,
    cost_usd: cost,
    response_time_ms: elapsed,
    success: true,
  });

  const parsed = parseCaptionArray(text, type, response.stop_reason);
  return parsed.map((item) => ({
    ...item,
    content_type: type,
  }));
}

/**
 * Parse the model's JSON array, and when it can't be parsed, say why.
 *
 * Ten post pieces failed in April with:
 *
 *   Caption generation failed: Expected ',' or '}' after property value in
 *   JSON at position 7320 (line 22 column 627)
 *
 * That message says nothing about the actual problem. The likely cause is
 * truncation: this call asks for up to 14 captions in one response against a
 * 4096-token budget, and when the model runs out mid-string the JSON is cut
 * off. `JSON.parse` then reports a syntax error deep inside the text, which
 * reads like malformed output rather than an output that simply stopped.
 *
 * So: check `stop_reason` first and name truncation explicitly, recover the
 * complete objects where the tail is the only casualty, and if it still fails,
 * throw an error that carries the stop reason and the text around the break.
 */
function parseCaptionArray(
  text: string,
  type: ContentType,
  stopReason: string | null,
): BatchCaptionResult[] {
  const truncated = stopReason === "max_tokens";

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as BatchCaptionResult[];
    } catch (err) {
      const salvaged = salvageObjects(jsonMatch[0]);
      if (salvaged.length > 0) {
        console.warn(
          `[captions] ${type}: array failed to parse but ${salvaged.length} complete ` +
            `object(s) were recovered${truncated ? " (response hit the token limit)" : ""}.`,
        );
        return salvaged;
      }
      throw new Error(caption_failure(type, truncated, text, err));
    }
  }

  // No closing bracket at all — the classic shape of a response cut off
  // mid-flight. Salvage whatever whole objects arrived before the cut.
  const salvaged = salvageObjects(text);
  if (salvaged.length > 0) {
    console.warn(
      `[captions] ${type}: response had no complete array; recovered ` +
        `${salvaged.length} object(s)${truncated ? " before the token limit" : ""}.`,
    );
    return salvaged;
  }

  throw new Error(caption_failure(type, truncated, text, null));
}

/** Pull out every syntactically complete {...} object, ignoring a broken tail. */
function salvageObjects(text: string): BatchCaptionResult[] {
  const objects: BatchCaptionResult[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') inString = true;
    else if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          const candidate = JSON.parse(text.slice(start, i + 1)) as BatchCaptionResult;
          // Only keep objects that carry the field everything downstream keys on.
          if (candidate && typeof candidate.day_number === "number") {
            objects.push(candidate);
          }
        } catch {
          // Incomplete or malformed object — skip it, keep scanning.
        }
        start = -1;
      }
    }
  }

  return objects;
}

/** Build an error message a human can act on. */
function caption_failure(
  type: ContentType,
  truncated: boolean,
  text: string,
  err: unknown,
): string {
  const reason = truncated
    ? "the model hit its max_tokens limit and the JSON was cut off mid-response — " +
      "ask for fewer captions per call or raise max_tokens"
    : "the model returned text that is not a parseable JSON array";

  const detail = err instanceof Error && err.message ? ` Parser said: ${err.message}.` : "";
  const preview = text.trim().slice(-220).replace(/\s+/g, " ");

  return (
    `Caption generation failed for ${type}: ${reason}.${detail} ` +
    `stop_reason=${truncated ? "max_tokens" : "other"}, response length=${text.length}. ` +
    `Response ended with: …${preview}`
  );
}
