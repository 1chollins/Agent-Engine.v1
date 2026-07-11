import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * Saves a Quick Post export to the user's content library: the PNG goes
 * to storage, the metadata (caption, hashtags, template) to quick_posts.
 * Called fire-and-forget by the composer after every download, so the
 * dashboard and Content tab reflect Quick Post activity.
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    image?: string;
    postType?: string;
    templateKey?: string;
    format?: string;
    headline?: string;
    area?: string;
    caption?: string;
    hashtags?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { image, postType, templateKey, format } = body;
  if (!image || !image.startsWith("data:image/png;base64,")) {
    return NextResponse.json(
      { error: "image must be a PNG data URL" },
      { status: 400 }
    );
  }
  if (!postType || !templateKey || !format) {
    return NextResponse.json(
      { error: "postType, templateKey and format are required" },
      { status: 400 }
    );
  }
  const base64 = image.slice(image.indexOf(",") + 1);
  if (base64.length > 8_000_000) {
    return NextResponse.json({ error: "Image too large" }, { status: 413 });
  }

  const serviceClient = createServiceClient();
  const buffer = Buffer.from(base64, "base64");
  const id = crypto.randomUUID();
  const assetPath = `${user.id}/quick-posts/${id}.png`;

  const { error: uploadError } = await serviceClient.storage
    .from("generated-content")
    .upload(assetPath, buffer, { contentType: "image/png", upsert: false });
  if (uploadError) {
    console.error("[quick-posts] upload failed:", uploadError.message);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { error: insertError } = await serviceClient.from("quick_posts").insert({
    id,
    user_id: user.id,
    post_type: postType,
    template_key: templateKey,
    format,
    headline: (body.headline ?? "").slice(0, 200),
    area: (body.area ?? "").slice(0, 120),
    caption: (body.caption ?? "").slice(0, 4000),
    hashtags: (body.hashtags ?? "").slice(0, 2000),
    asset_path: assetPath,
  });
  if (insertError) {
    console.error("[quick-posts] insert failed:", insertError.message);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ saved: true, id });
}
