import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { classifyPhoto } from "@/lib/generation/photo-tagging";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
      `[photos/tag] Storage download failed for ${photoId}:`,
      downloadErr?.message
    );
    return NextResponse.json(
      { tagged: false, reason: "download_failed" },
      { status: 200 }
    );
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());

  let tag: string;
  try {
    const result = await classifyPhoto({
      imageBuffer: buffer,
      supabase: serviceClient,
      listingId: photo.listing_id,
    });
    tag = result.tag;
  } catch (err) {
    console.error(
      `[photos/tag] classifyPhoto failed for ${photoId}:`,
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { tagged: false, reason: "classify_failed" },
      { status: 200 }
    );
  }

  // Write content_tag back to the row
  const { error: updateErr } = await serviceClient
    .from("listing_photos")
    .update({ content_tag: tag })
    .eq("id", photoId);

  if (updateErr) {
    console.error(
      `[photos/tag] DB update failed for ${photoId}:`,
      updateErr.message
    );
    return NextResponse.json(
      { tagged: false, reason: "db_update_failed" },
      { status: 200 }
    );
  }

  return NextResponse.json({ tagged: true, content_tag: tag });
}
