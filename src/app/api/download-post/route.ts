import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import archiver from "archiver";
import { PassThrough } from "stream";

/**
 * Downloads both IG and FB versions of a post as a single ZIP.
 *
 * GET /api/download-post?ig=<path>&fb=<path>&name=<base_filename>
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const igPath = searchParams.get("ig");
  const fbPath = searchParams.get("fb");
  const baseName = searchParams.get("name") ?? "post";

  if (!igPath || !fbPath) {
    return NextResponse.json({ error: "Missing ig or fb path" }, { status: 400 });
  }

  if (!igPath.startsWith(user.id) || !fbPath.startsWith(user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [igResult, fbResult] = await Promise.all([
    supabase.storage.from("generated-content").download(igPath),
    supabase.storage.from("generated-content").download(fbPath),
  ]);

  if (igResult.error || !igResult.data || fbResult.error || !fbResult.data) {
    return NextResponse.json({ error: "Files not found" }, { status: 404 });
  }

  const [igBuffer, fbBuffer] = await Promise.all([
    igResult.data.arrayBuffer().then((ab) => Buffer.from(ab)),
    fbResult.data.arrayBuffer().then((ab) => Buffer.from(ab)),
  ]);

  const archive = archiver("zip", { zlib: { level: 1 } }); // fast, minimal compression for PNGs
  const passthrough = new PassThrough();
  archive.pipe(passthrough);

  archive.append(igBuffer, { name: `${baseName}-instagram-1080x1080.png` });
  archive.append(fbBuffer, { name: `${baseName}-facebook-1200x630.png` });
  archive.finalize();

  const readable = new ReadableStream({
    start(controller) {
      passthrough.on("data", (chunk) => controller.enqueue(chunk));
      passthrough.on("end", () => controller.close());
      passthrough.on("error", (err) => controller.error(err));
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${baseName}.zip"`,
    },
  });
}
