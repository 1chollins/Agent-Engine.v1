import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import type { ContentType } from "@/types/content";

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

const POST_THEMES = [
  "Just Listed — grand reveal with key highlights",
  "Lifestyle — paint a picture of daily life in this home",
  "Feature Spotlight — deep dive into standout features",
  "Neighborhood & Location — community, schools, dining, commute",
  "Open House / Call to Action — urgency and next steps",
];

const REEL_THEMES = [
  "Virtual Tour — walk-through energy, room-by-room highlights",
  "Top 5 Features — countdown of best selling points",
  "Day in the Life — morning-to-evening lifestyle at this property",
  "Before You Miss It — urgency, scarcity, market context",
  "Your Dream Home — emotional appeal, future-casting",
];

function buildListingContext(listing: Listing, brand: BrandProfile): string {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(listing.price);

  const details = [
    `Address: ${listing.address}, ${listing.city}, ${listing.state} ${listing.zip_code}`,
    `Price: ${price}`,
    `Property Type: ${listing.property_type.replace("_", " ")}`,
    listing.bedrooms ? `Bedrooms: ${listing.bedrooms}` : null,
    listing.bathrooms ? `Bathrooms: ${listing.bathrooms}` : null,
    `Square Feet: ${listing.sqft.toLocaleString()}`,
    listing.lot_size ? `Lot Size: ${listing.lot_size}` : null,
    listing.year_built ? `Year Built: ${listing.year_built}` : null,
    `Key Features: ${listing.features}`,
    listing.neighborhood ? `Neighborhood: ${listing.neighborhood}` : null,
    listing.hoa_info ? `HOA: ${listing.hoa_info}` : null,
    listing.additional_notes ? `Notes: ${listing.additional_notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `PROPERTY DETAILS:\n${details}\n\nAGENT INFO:\nName: ${brand.agent_name}\nTitle: ${brand.agent_title}\nBrokerage: ${brand.brokerage_name}\nPhone: ${brand.phone}\nEmail: ${brand.email}${brand.instagram_handle ? `\nInstagram: ${brand.instagram_handle}` : ""}`;
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
      POST_THEMES,
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
      REEL_THEMES,
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
  themes: string[],
  listingId: string,
  supabase: ReturnType<typeof createServiceClient>
): Promise<BatchCaptionResult[]> {
  const wordRange = type === "post" ? "150–250" : "100–150";
  const themeList = pieces
    .map((p, i) => `- Day ${p.day_number}: Theme — "${themes[i % themes.length]}"`)
    .join("\n");

  const prompt = `You are a real estate social media copywriter. Generate ${type} captions for a 14-day content calendar.

${context}

TONE: ${toneGuide}

Generate captions for these ${pieces.length} ${type}s:
${themeList}

For EACH ${type}, output:
1. Instagram caption (${wordRange} words). Include emojis sparingly. End with a call-to-action mentioning ${brand.agent_name}.
2. Facebook caption (${wordRange} words). Slightly longer and more detailed than Instagram. End with a call-to-action.
3. 20–30 hashtags including: #${listing.city.replace(/\s/g, "")}RealEstate, #${listing.city.replace(/\s/g, "")}Homes, location-specific tags, property feature tags, and general real estate tags.

RULES:
- Every caption MUST reference specific property details (price, address, features, neighborhood)
- Each caption must be UNIQUE — different angle, different opening line, different CTA
- Never start two captions the same way
- Include the agent's contact info naturally in the CTA
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

  // Parse response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse ${type} caption response`);
  }

  const parsed = JSON.parse(jsonMatch[0]) as BatchCaptionResult[];
  return parsed.map((item) => ({
    ...item,
    content_type: type,
  }));
}
