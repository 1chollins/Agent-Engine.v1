import { NextRequest, NextResponse } from "next/server";

/**
 * AI autofill: given a listing photo + rough location + post type, draft
 * the post fields (headline, features, pool label, CTA, cleaned area).
 *
 * Calls the Anthropic REST API directly (no SDK dependency). Requires
 * ANTHROPIC_API_KEY in the environment.
 *
 * NOTE: Post Studio has no auth yet, so this endpoint is lightly
 * defended: same-origin check + a small per-IP rate limit. When the
 * suite gets shared auth (FF Hub Phase B), gate this properly.
 */

const MODEL = "claude-haiku-4-5-20251001";
const MAX_REQUESTS_PER_HOUR = 30;

const rateBucket = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateBucket.get(ip);
  if (!entry || now > entry.resetAt) {
    rateBucket.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS_PER_HOUR;
}

type AutofillResult = {
  headline: string;
  features: string[];
  pool: string;
  cta: string;
  area: string;
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Autofill is not configured (missing API key)" },
      { status: 503 }
    );
  }

  // Same-origin check — this endpoint exists for the Post Studio UI only.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests — try again later" },
      { status: 429 }
    );
  }

  let body: { image?: string; area?: string; postLabel?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { image, area, postLabel } = body;
  if (!image || !image.startsWith("data:image/jpeg;base64,")) {
    return NextResponse.json(
      { error: "image must be a JPEG data URL" },
      { status: 400 }
    );
  }
  const base64 = image.slice(image.indexOf(",") + 1);
  if (base64.length > 1_500_000) {
    return NextResponse.json({ error: "Image too large" }, { status: 413 });
  }

  const prompt = `You are a real estate social media copywriter. Look at this listing photo. The post type is "${postLabel ?? "Just Listed"}" and the location input is "${area ?? ""}".

Return ONLY a JSON object, no other text:
{
  "headline": "<catchy hook, 8 words max, no street address>",
  "features": ["<feature 1>", "<feature 2>", "<feature 3>"],
  "pool": "<'Private Pool' if a pool is visible or clearly implied, otherwise ''>",
  "cta": "<call to action, 7 words max, matching the post type>",
  "area": "<the location cleaned up as 'City, ST'; if unusable, ''>"
}

Rules:
- Features must be things actually VISIBLE in the photo or safely implied by it (e.g. 'Screened lanai', 'Waterfront views', 'Open floor plan'). 2-4 words each.
- Never invent bedroom/bathroom counts, prices, or square footage.
- Match the energy of the post type: leasing posts invite, sold posts celebrate, listed posts tease.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: base64 },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[autofill] Anthropic error:", response.status, detail);
    return NextResponse.json(
      { error: "Autofill service error" },
      { status: 502 }
    );
  }

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((c) => c.type === "text")?.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json(
      { error: "Could not parse autofill response" },
      { status: 502 }
    );
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Partial<AutofillResult>;
    const result: AutofillResult = {
      headline: String(parsed.headline ?? "").slice(0, 90),
      features: (Array.isArray(parsed.features) ? parsed.features : [])
        .slice(0, 3)
        .map((f) => String(f).slice(0, 60)),
      pool: String(parsed.pool ?? "").slice(0, 40),
      cta: String(parsed.cta ?? "").slice(0, 80),
      area: String(parsed.area ?? "").slice(0, 60),
    };
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Could not parse autofill response" },
      { status: 502 }
    );
  }
}
