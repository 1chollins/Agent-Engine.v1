import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import {
  audienceOf,
  audienceRules,
  AUDIENCE_COPY,
  brandPromptDetails,
  listingPromptDetails,
  THEMES,
} from "@/lib/audience";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

const MODEL = "claude-haiku-4-5-20251001";
const INPUT_COST_PER_MILLION = 0.80;
const OUTPUT_COST_PER_MILLION = 4.00;

export type StoryTextResult = {
  day_number: number;
  story_teaser: string;
  story_cta: string;
  caption_instagram: string;
  caption_facebook: string;
  hashtags: string;
};

export async function generateStoryText(
  listing: Listing,
  brand: BrandProfile,
  storyDays: number[],
  listingId: string
): Promise<StoryTextResult[]> {
  const supabase = createServiceClient();

  const audience = audienceOf(brand);
  const copy = AUDIENCE_COPY[audience];
  const themes = THEMES[audience].stories;

  const toneMap: Record<string, string> = {
    professional: "polished and authoritative",
    friendly: "warm and approachable",
    luxury: "elevated and aspirational",
    casual: "relaxed and down-to-earth",
  };

  const themeList = storyDays
    .map((day, i) => `- Day ${day}: "${themes[i % themes.length]}"`)
    .join("\n");

  const prompt = `You are a ${copy.writer} creating Instagram/Facebook Story content.

PROPERTY:
${listingPromptDetails(listing, audience)}

${brandPromptDetails(brand, audience)}

RULES FOR THIS PROPERTY:
${audienceRules(listing, audience)}

TONE: ${toneMap[brand.tone] ?? "professional"}

Generate story content for ${storyDays.length} stories:
${themeList}

For EACH story, provide:
1. story_teaser: A punchy 1–2 line teaser for the story image overlay (under 15 words). Eye-catching, property-specific.
2. story_cta: A short CTA text (e.g., ${audience === "host" ? '"Link in bio to book", "DM for dates", "Check availability"' : '"DM for details", "Link in bio", "Tap to learn more"'}). Include the ${copy.noun}'s name or handle.
3. caption_instagram: Brief caption (20–40 words MAX) for the story post. Hook line + one detail + CTA, separated by line breaks. Never a dense paragraph.
4. caption_facebook: Brief caption (25–50 words MAX) for Facebook. Same structure.
5. hashtags: 10–15 relevant hashtags as a single space-separated string.

RULES:
- Each story must be UNIQUE with a different angle
- Teasers must be concise enough for visual overlay on a photo
- CTAs must vary — don't repeat the same CTA
- Reference actual property details in every teaser

Respond in this exact JSON format:
[
  {
    "day_number": <number>,
    "story_teaser": "<teaser>",
    "story_cta": "<cta>",
    "caption_instagram": "<caption>",
    "caption_facebook": "<caption>",
    "hashtags": "<hashtags>"
  }
]

Return ONLY the JSON array, no other text.`;

  const startTime = Date.now();
  const response = await getAnthropicClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });
  const elapsed = Date.now() - startTime;

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cost =
    (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION +
    (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;

  await supabase.from("cost_logs").insert({
    listing_id: listingId,
    service: "claude",
    endpoint: "messages.create:story-text",
    cost_usd: cost,
    response_time_ms: elapsed,
    success: true,
  });

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse story text response");
  }

  return JSON.parse(jsonMatch[0]) as StoryTextResult[];
}
