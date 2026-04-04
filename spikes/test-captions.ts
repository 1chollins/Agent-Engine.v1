import { config } from "dotenv";
config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a real estate social media content expert. You generate engaging, property-specific social media content for realtors. Always write in the requested tone. Never use generic filler — every sentence should reference actual property details.`;

const USER_PROMPT = `Generate social media content for this property listing.

**Property Details:**
- Type: Single Family Home
- Address: 1842 SW 25th Terrace, Cape Coral, FL 33914
- Price: $459,900
- Bedrooms: 4
- Bathrooms: 3
- Square Footage: 2,150
- Features: heated pool, updated kitchen with quartz countertops, impact windows, new roof 2023, canal access with boat dock
- Neighborhood: Pelican area, Cape Coral

**Agent Info:**
- Name: Colby Hollins
- Title: Realtor
- Brokerage: Frame & Form Studio

**Tone:** Professional

**Generate ALL of the following as JSON:**

1. "instagram_caption" — Instagram post caption (150–250 words). Use line breaks for readability, tasteful emoji, end with a CTA.
2. "facebook_caption" — Facebook post caption (150–250 words). Slightly more conversational than Instagram, end with a CTA.
3. "hashtags" — Array of 25 relevant hashtags (mix of location, property type, lifestyle, real estate).
4. "story_teaser" — 1–2 punchy lines for an Instagram/Facebook story teaser.
5. "story_cta" — Short CTA text for the story (e.g., "DM for details").

Return ONLY valid JSON. No markdown code fences.`;

async function main() {
  const start = performance.now();

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: USER_PROMPT }],
  });

  const elapsed = Math.round(performance.now() - start);

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  console.log("=== RAW RESPONSE ===\n");
  console.log(text);

  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "");
    const parsed = JSON.parse(cleaned);
    console.log("\n=== PARSED JSON ===\n");
    console.log(JSON.stringify(parsed, null, 2));
  } catch {
    console.log("\n⚠ Response was not valid JSON — check formatting prompt");
  }

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;

  // Claude Haiku 4.5 pricing: $0.80/M input, $4.00/M output
  const inputCost = (inputTokens / 1_000_000) * 0.8;
  const outputCost = (outputTokens / 1_000_000) * 4.0;
  const totalCost = inputCost + outputCost;

  console.log("\n=== COST & USAGE ===\n");
  console.log(`Model:         ${response.model}`);
  console.log(`Input tokens:  ${inputTokens}`);
  console.log(`Output tokens: ${outputTokens}`);
  console.log(`Input cost:    $${inputCost.toFixed(6)}`);
  console.log(`Output cost:   $${outputCost.toFixed(6)}`);
  console.log(`Total cost:    $${totalCost.toFixed(6)}`);
  console.log(`Response time: ${elapsed}ms`);
  console.log(`Stop reason:   ${response.stop_reason}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
