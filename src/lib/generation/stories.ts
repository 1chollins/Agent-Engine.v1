import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

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

const STORY_THEMES = [
  "Sneak Peek — tease a standout feature to spark curiosity",
  "Price Drop / Value Play — highlight the price and what you get",
  "Neighborhood Spotlight — local dining, parks, schools, commute",
  "Last Chance / Urgency — create FOMO, push to action",
];

export async function generateStoryText(
  listing: Listing,
  brand: BrandProfile,
  storyDays: number[],
  listingId: string
): Promise<StoryTextResult[]> {
  const supabase = createServiceClient();

  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(listing.price);

  const toneMap: Record<string, string> = {
    professional: "polished and authoritative",
    friendly: "warm and approachable",
    luxury: "elevated and aspirational",
    casual: "relaxed and down-to-earth",
  };

  const themeList = storyDays
    .map((day, i) => `- Day ${day}: "${STORY_THEMES[i % STORY_THEMES.length]}"`)
    .join("\n");

  const prompt = `You are a real estate social media copywriter creating Instagram/Facebook Story content.

PROPERTY:
- Address: ${listing.address}, ${listing.city}, ${listing.state} ${listing.zip_code}
- Price: ${price}
- Type: ${listing.property_type.replace("_", " ")}
${listing.bedrooms ? `- Bedrooms: ${listing.bedrooms}` : ""}
${listing.bathrooms ? `- Bathrooms: ${listing.bathrooms}` : ""}
- Sqft: ${listing.sqft.toLocaleString()}
- Features: ${listing.features}
${listing.neighborhood ? `- Neighborhood: ${listing.neighborhood}` : ""}

AGENT: ${brand.agent_name}, ${brand.brokerage_name}
${brand.instagram_handle ? `Instagram: ${brand.instagram_handle}` : ""}
Phone: ${brand.phone}

TONE: ${toneMap[brand.tone] ?? "professional"}

Generate story content for ${storyDays.length} stories:
${themeList}

For EACH story, provide:
1. story_teaser: A punchy 1–2 line teaser for the story image overlay (under 15 words). Eye-catching, property-specific.
2. story_cta: A short CTA text (e.g., "DM for details", "Link in bio", "Tap to learn more"). Include agent name or handle.
3. caption_instagram: Brief caption (50–80 words) for the story post.
4. caption_facebook: Brief caption (50–80 words) for Facebook.
5. hashtags: 15–20 relevant hashtags as a single space-separated string.

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
  const response = await anthropic.messages.create({
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
