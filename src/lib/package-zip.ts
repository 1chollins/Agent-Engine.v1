import archiver from "archiver";
import { PassThrough } from "stream";
import { createServiceClient } from "@/lib/supabase/server";
import type { ContentPiece } from "@/types/content";

/**
 * Streams a campaign's finished pieces as a ZIP (posts/, reels/, stories/ and
 * a content-calendar.csv with every caption). Callers must authorize first —
 * this reads with the service client.
 */
export async function packageZipResponse(packageId: string, address: string): Promise<Response> {
  const supabase = createServiceClient();
  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("package_id", packageId)
    .eq("status", "complete")
    .order("day_number");

  const typedPieces = (pieces ?? []) as ContentPiece[];
  if (typedPieces.length === 0) {
    return Response.json({ error: "No completed pieces to download" }, { status: 400 });
  }

  const archive = archiver("zip", { zlib: { level: 5 } });
  const passthrough = new PassThrough();
  archive.pipe(passthrough);

  for (const piece of typedPieces) {
    const dayStr = String(piece.day_number).padStart(2, "0");
    const ext = piece.asset_type === "video" ? "mp4" : "png";

    if (piece.asset_path) {
      const { data } = await supabase.storage.from("generated-content").download(piece.asset_path);
      if (data) {
        const buffer = Buffer.from(await data.arrayBuffer());
        const folder =
          piece.content_type === "post" ? "posts" : piece.content_type === "reel" ? "reels" : "stories";
        archive.append(buffer, { name: `${folder}/day${dayStr}-${piece.content_type}.${ext}` });
      }
    }

    if (piece.asset_path_alt && piece.content_type === "post") {
      const { data } = await supabase.storage.from("generated-content").download(piece.asset_path_alt);
      if (data) {
        const buffer = Buffer.from(await data.arrayBuffer());
        archive.append(buffer, { name: `posts/day${dayStr}-post-fb.png` });
      }
    }
  }

  const csvRows = ["Day,Type,Recommended Time,Instagram Caption,Facebook Caption,Hashtags"];
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

  const readable = new ReadableStream({
    start(controller) {
      passthrough.on("data", (chunk) => controller.enqueue(chunk));
      passthrough.on("end", () => controller.close());
      passthrough.on("error", (err) => controller.error(err));
    },
  });

  const slug = (address || "content").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
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
