import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import archiver from "archiver";
import { PassThrough } from "stream";
import type { ContentPiece } from "@/types/content";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: pkg } = await supabase
    .from("content_packages")
    .select("id, status, listing_id, listings!inner(user_id, address, city)")
    .eq("id", params.id)
    .single();

  const pkgData = pkg as Record<string, unknown> | null;
  const pkgListings = pkgData?.listings as Record<string, unknown> | undefined;

  if (!pkgData || pkgListings?.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (pkgData.status === "processing") {
    return NextResponse.json(
      { error: "Package is still processing" },
      { status: 400 }
    );
  }

  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("package_id", params.id)
    .eq("status", "complete")
    .order("day_number");

  if (!pieces || pieces.length === 0) {
    return NextResponse.json(
      { error: "No completed pieces to download" },
      { status: 400 }
    );
  }

  const typedPieces = pieces as ContentPiece[];
  const serviceClient = createServiceClient();

  // Create ZIP archive
  const archive = archiver("zip", { zlib: { level: 5 } });
  const passthrough = new PassThrough();
  archive.pipe(passthrough);

  // Add assets to ZIP organized by type
  for (const piece of typedPieces) {
    const dayStr = String(piece.day_number).padStart(2, "0");
    const ext = piece.asset_type === "video" ? "mp4" : "png";

    // Primary asset
    if (piece.asset_path) {
      const { data } = await serviceClient.storage
        .from("generated-content")
        .download(piece.asset_path);

      if (data) {
        const buffer = Buffer.from(await data.arrayBuffer());
        const folder =
          piece.content_type === "post"
            ? "posts"
            : piece.content_type === "reel"
              ? "reels"
              : "stories";
        archive.append(buffer, {
          name: `${folder}/day${dayStr}-${piece.content_type}.${ext}`,
        });
      }
    }

    // FB variant for posts
    if (piece.asset_path_alt && piece.content_type === "post") {
      const { data } = await serviceClient.storage
        .from("generated-content")
        .download(piece.asset_path_alt);

      if (data) {
        const buffer = Buffer.from(await data.arrayBuffer());
        archive.append(buffer, {
          name: `posts/day${dayStr}-post-fb.png`,
        });
      }
    }
  }

  // Add CSV manifest
  const csvRows = [
    "Day,Type,Recommended Time,Instagram Caption,Facebook Caption,Hashtags",
  ];
  for (const piece of typedPieces) {
    csvRows.push(
      [
        piece.day_number,
        piece.content_type,
        piece.recommended_time,
        csvEscape(piece.caption_instagram ?? ""),
        csvEscape(piece.caption_facebook ?? ""),
        csvEscape(piece.hashtags ?? ""),
      ].join(",")
    );
  }
  archive.append(csvRows.join("\n"), { name: "content-calendar.csv" });

  archive.finalize();

  // Convert PassThrough stream to ReadableStream for Response
  const readable = new ReadableStream({
    start(controller) {
      passthrough.on("data", (chunk) => controller.enqueue(chunk));
      passthrough.on("end", () => controller.close());
      passthrough.on("error", (err) => controller.error(err));
    },
  });

  const slug = ((pkgListings?.address as string) ?? "content")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);

  return new Response(readable, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}-content-package.zip"`,
    },
  });
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
