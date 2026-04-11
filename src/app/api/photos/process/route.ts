import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import sharp from "sharp";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function computeOrientation(
  width: number,
  height: number
): "horizontal" | "vertical" | "square" {
  const ratio = width / height;
  if (ratio > 1.1) return "horizontal";
  if (ratio < 0.9) return "vertical";
  return "square";
}

export async function POST(request: NextRequest) {
  // Auth: verify session via cookie-based client
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate request body
  let photoId: string;
  let filePath: string;
  try {
    const body = await request.json();
    photoId = body.photo_id;
    filePath = body.file_path;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!photoId || !filePath) {
    return NextResponse.json(
      { error: "photo_id and file_path are required" },
      { status: 400 }
    );
  }

  if (!UUID_RE.test(photoId)) {
    return NextResponse.json(
      { error: "photo_id must be a valid UUID" },
      { status: 400 }
    );
  }

  // Fetch photo row and verify ownership via listing join
  const { data: photo, error: photoErr } = await supabase
    .from("listing_photos")
    .select("id, file_path, listing_id, listings!inner(user_id)")
    .eq("id", photoId)
    .single();

  if (photoErr || !photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  // RLS already scopes to the user's listings, but the join
  // confirms ownership explicitly. If RLS filtered it out,
  // we'd hit the 404 above.

  // Verify file_path matches the stored record
  if (photo.file_path !== filePath) {
    return NextResponse.json(
      { error: "file_path does not match record" },
      { status: 403 }
    );
  }

  // Download file from storage using service role client
  const serviceClient = createServiceClient();
  const { data: fileData, error: downloadErr } = await serviceClient.storage
    .from("listing-photos")
    .download(filePath);

  if (downloadErr || !fileData) {
    console.error(
      `[photos/process] Storage download failed for ${photoId}:`,
      downloadErr?.message
    );
    return NextResponse.json(
      { processed: false, reason: "download_failed" },
      { status: 200 }
    );
  }

  // Extract dimensions via sharp
  let width: number;
  let height: number;
  try {
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error("No dimensions in metadata");
    }
    width = metadata.width;
    height = metadata.height;
  } catch (err) {
    console.error(
      `[photos/process] sharp metadata failed for ${photoId}:`,
      err
    );
    return NextResponse.json(
      { processed: false, reason: "metadata_failed" },
      { status: 200 }
    );
  }

  const orientation = computeOrientation(width, height);

  // Update the row with width, height, and orientation
  const { error: updateErr } = await serviceClient
    .from("listing_photos")
    .update({ width, height, orientation })
    .eq("id", photoId);

  if (updateErr) {
    console.error(
      `[photos/process] DB update failed for ${photoId}:`,
      updateErr.message
    );
    return NextResponse.json(
      { error: "Failed to update photo record" },
      { status: 500 }
    );
  }

  return NextResponse.json({ processed: true, width, height, orientation });
}
