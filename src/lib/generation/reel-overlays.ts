import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

const MODEL = "claude-haiku-4-5-20251001";
const INPUT_COST_PER_MILLION = 0.80;
const OUTPUT_COST_PER_MILLION = 4.00;

export type ReelOverlayResult = {
  day_number: number;
  text_overlay: string; // JSON stringified array of phrases
};

const REEL_OVERLAY_ANGLES = [
  "Room-by-room highlights — kitchen, living, master, outdoor",
  "Lifestyle selling points — morning coffee spot, entertaining space, quiet retreat",
  "Numbers that sell — price, sqft, beds/baths, lot size",
  "Location perks — nearby amenities, commute times, school district",
  "Emotional hooks — dream home language, future-casting, aspirational",
];

export async function generateReelOverlays(
  listing: Listing,
  brand: BrandProfile,
  reelDays: number[],
  listingId: string
): Promise<ReelOverlayResult[]> {
  const supabase = createServiceClient();

  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(listing.price);

  const angleList = reelDays
    .map((day, i) => `- Day ${day}: "${REEL_OVERLAY_ANGLES[i % REEL_OVERLAY_ANGLES.length]}"`)
    .join("\n");

  const prompt = `You are a real estate video content creator writing text overlays for Instagram/Facebook Reels.

PROPERTY:
- Address: ${listing.address}, ${listing.city}, ${listing.state}
- Price: ${price}
- Type: ${listing.property_type.replace("_", " ")}
${listing.bedrooms ? `- Bedrooms: ${listing.bedrooms}` : ""}
${listing.bathrooms ? `- Bathrooms: ${listing.bathrooms}` : ""}
- Sqft: ${listing.sqft.toLocaleString()}
- Features: ${listing.features}
${listing.neighborhood ? `- Neighborhood: ${listing.neighborhood}` : ""}

AGENT: ${brand.agent_name}, ${brand.brokerage_name}

Generate text overlay phrases for ${reelDays.length} video reels:
${angleList}

For EACH reel, provide 3–5 short text overlay phrases that will appear on screen during the video.

RULES:
- Each phrase MUST be under 8 words (they appear as large text on video)
- Phrases should be punchy, property-specific, and visually impactful
- Reference actual details — don't be generic
- Each reel's phrases should follow its angle/theme
- The last phrase in each reel should be a CTA or the agent's name
- No hashtags in overlays

Examples of good overlay phrases:
- "4 Beds • 3 Baths • ${price}"
- "Chef's Kitchen with Marble Island"
- "10 Min to Downtown ${listing.city}"
- "Call ${brand.agent_name} Today"

Respond in this exact JSON format:
[
  {
    "day_number": <number>,
    "phrases": ["phrase 1", "phrase 2", "phrase 3", "phrase 4"]
  }
]

Return ONLY the JSON array, no other text.`;

  const startTime = Date.now();
  const response = await getAnthropicClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
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
    endpoint: "messages.create:reel-overlays",
    cost_usd: cost,
    response_time_ms: elapsed,
    success: true,
  });

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse reel overlay response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    day_number: number;
    phrases: string[];
  }[];

  return parsed.map((item) => ({
    day_number: item.day_number,
    text_overlay: JSON.stringify(item.phrases),
  }));
}
