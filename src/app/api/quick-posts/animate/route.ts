import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { inngest } from "@/inngest/client";

/** 5 animated exports/day on free accounts; each export = 2 renders. */
const DAILY_VIDEO_ROW_LIMIT = 10;

/**
 * Queues an animated Quick Post: uploads the source photo (and logo),
 * inserts two processing rows (square + story), and hands off to
 * Inngest for the Lambda renders. Finished videos appear in the
 * Content tab's Quick Posts section.
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    photo?: string; // data URL of the listing photo (not the rendered PNG)
    logo?: string | null; // data URL or null
    postType?: string;
    eyebrow?: string;
    headline?: string;
    area?: string;
    specsLine?: string;
    featuresLine?: string;
    cta?: string;
    brandName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    caption?: string;
    hashtags?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { photo, headline, eyebrow, postType } = body;
  if (!photo || !photo.startsWith("data:image/")) {
    return NextResponse.json(
      { error: "Upload a photo first — the animation needs one." },
      { status: 400 }
    );
  }
  if (!headline || !eyebrow || !postType) {
    return NextResponse.json(
      { error: "headline, eyebrow and postType are required" },
      { status: 400 }
    );
  }

  const serviceClient = createServiceClient();

  // Daily cap (free tier): count video rows from the last 24h
  const { count } = await serviceClient
    .from("quick_posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("asset_type", "video")
    .gt("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString());
  if ((count ?? 0) >= DAILY_VIDEO_ROW_LIMIT) {
    return NextResponse.json(
      { error: "Daily animated-export limit reached (5/day during beta). Try again tomorrow." },
      { status: 429 }
    );
  }

  // Upload source assets so Lambda can fetch them by URL
  const batchId = crypto.randomUUID();
  async function uploadDataUrl(dataUrl: string, name: string): Promise<string | null> {
    const comma = dataUrl.indexOf(",");
    const meta = dataUrl.slice(0, comma);
    const base64 = dataUrl.slice(comma + 1);
    if (base64.length > 3_000_000) return null;
    const mime = meta.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
    const ext = mime.includes("png") ? "png" : "jpg";
    const path = `${user!.id}/quick-posts/src/${batchId}-${name}.${ext}`;
    const { error } = await serviceClient.storage
      .from("generated-content")
      .upload(path, Buffer.from(base64, "base64"), { contentType: mime, upsert: true });
    if (error) return null;
    const { data: signed } = await serviceClient.storage
      .from("generated-content")
      .createSignedUrl(path, 7200);
    return signed?.signedUrl ?? null;
  }

  const photoUrl = await uploadDataUrl(photo, "photo");
  if (!photoUrl) {
    return NextResponse.json({ error: "Photo upload failed" }, { status: 500 });
  }
  const logoUrl =
    body.logo && body.logo.startsWith("data:image/")
      ? await uploadDataUrl(body.logo, "logo")
      : null;

  const clip = (v: string | undefined, n: number) => (v ?? "").trim().slice(0, n) || null;
  const inputProps = {
    photoUrl,
    eyebrow: String(eyebrow).slice(0, 60),
    headline: String(headline).slice(0, 120),
    area: clip(body.area, 80),
    specsLine: clip(body.specsLine, 120),
    featuresLine: clip(body.featuresLine, 140),
    cta: clip(body.cta, 60),
    brandName: clip(body.brandName, 80) ?? "Frame & Form Studio",
    logoUrl,
    primaryColor: clip(body.primaryColor, 20) ?? "#3d4a2f",
    secondaryColor: clip(body.secondaryColor, 20) ?? "#c29870",
    seed: Math.floor(Math.random() * 100000),
    watermark: true, // beta: animated exports carry the watermark on all accounts
  };

  // Two rows: square + story, both processing
  const variants = [
    { format: "square", compositionId: "AnimatedQuickPost" },
    { format: "story", compositionId: "AnimatedQuickPost-Story" },
  ];
  const rows = variants.map((v) => ({
    id: crypto.randomUUID(),
    user_id: user.id,
    post_type: String(postType).slice(0, 60),
    template_key: "animated",
    format: v.format,
    headline: inputProps.headline,
    area: inputProps.area ?? "",
    caption: (body.caption ?? "").slice(0, 4000),
    hashtags: (body.hashtags ?? "").slice(0, 2000),
    asset_path: `${user.id}/quick-posts/${batchId}-${v.format}.mp4`,
    asset_type: "video",
    status: "processing",
  }));

  const { error: insertError } = await serviceClient.from("quick_posts").insert(rows);
  if (insertError) {
    console.error("[quick-posts/animate] insert failed:", insertError.message);
    return NextResponse.json({ error: "Could not queue renders" }, { status: 500 });
  }

  await inngest.send({
    name: "quickpost/animate.requested",
    data: {
      user_id: user.id,
      renders: variants.map((v, i) => ({
        row_id: rows[i].id,
        asset_path: rows[i].asset_path,
        composition_id: v.compositionId,
      })),
      input_props: inputProps,
    },
  });

  return NextResponse.json({ queued: true, count: rows.length });
}
