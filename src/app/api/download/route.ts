import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Proxies a file download from Supabase Storage with proper Content-Disposition
 * header so the browser triggers a save dialog instead of navigating.
 *
 * GET /api/download?path=<storage_path>&bucket=<bucket>&name=<filename>
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const storagePath = searchParams.get("path");
  const bucket = searchParams.get("bucket") ?? "generated-content";
  const filename = searchParams.get("name") ?? "download";

  if (!storagePath) {
    return NextResponse.json({ error: "Missing path param" }, { status: 400 });
  }

  // Verify the file belongs to the user (path starts with user_id)
  if (!storagePath.startsWith(user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase.storage.from(bucket).download(storagePath);

  if (error || !data) {
    return NextResponse.json(
      { error: `File not found: ${error?.message}` },
      { status: 404 }
    );
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const contentType = data.type || guessContentType(filename);

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
    },
  });
}

function guessContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    mp4: "video/mp4",
    webm: "video/webm",
  };
  return types[ext ?? ""] ?? "application/octet-stream";
}
