import ffmpeg from "fluent-ffmpeg";
import { createServiceClient } from "@/lib/supabase/server";
import { selectMusicTrack } from "./music";
import { join } from "path";
import { mkdirSync, existsSync, writeFileSync, unlinkSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const CROSSFADE_DURATION = 0.5;
const MUSIC_VOLUME = 0.3;
const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = 1920;

type StitchOptions = {
  clipPaths: string[]; // Paths in Supabase storage (generated-content bucket)
  textOverlays: string[]; // Text overlay phrases to burn in
  listingId: string;
  pieceId: string;
  userId: string;
  dayNumber: number;
  brandTone?: string;
};

type StitchResult = {
  outputPath: string; // Path in Supabase storage
  durationSeconds: number;
};

/**
 * Stitches video clips into a single reel with crossfade transitions,
 * text overlays, and background music.
 */
export async function stitchReelVideo(
  options: StitchOptions
): Promise<StitchResult> {
  const { clipPaths, textOverlays, listingId, pieceId, userId, dayNumber, brandTone } = options;
  const supabase = createServiceClient();
  const startTime = Date.now();
  const workDir = join(tmpdir(), `ae-stitch-${randomUUID()}`);
  mkdirSync(workDir, { recursive: true });

  try {
    // Download clips from Supabase storage to local temp dir
    const localClips: string[] = [];
    for (let i = 0; i < clipPaths.length; i++) {
      const { data, error } = await supabase.storage
        .from("generated-content")
        .download(clipPaths[i]);

      if (error || !data) {
        throw new Error(`Failed to download clip ${i}: ${error?.message}`);
      }

      const localPath = join(workDir, `clip-${i}.mp4`);
      const buffer = Buffer.from(await data.arrayBuffer());
      writeFileSync(localPath, buffer);
      localClips.push(localPath);
    }

    // Select music track
    const music = selectMusicTrack(brandTone);
    const hasMusicFile = existsSync(music.path);

    // Build FFmpeg filter for crossfade stitching + text overlays
    const outputPath = join(workDir, "output.mp4");

    await new Promise<void>((resolve, reject) => {
      let command = ffmpeg();

      // Add all clips as inputs
      for (const clip of localClips) {
        command = command.input(clip);
      }

      // Add music if available
      if (hasMusicFile) {
        command = command.input(music.path);
      }

      // Build complex filter
      const filters: string[] = [];
      const clipCount = localClips.length;

      // Scale and pad each clip to ensure consistent dimensions
      for (let i = 0; i < clipCount; i++) {
        filters.push(
          `[${i}:v]scale=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:force_original_aspect_ratio=decrease,` +
          `pad=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:(ow-iw)/2:(oh-ih)/2:black,` +
          `setsar=1,fps=30[v${i}]`
        );
      }

      // Apply crossfade transitions between clips
      if (clipCount === 1) {
        // Single clip — just use it directly
        filters.push(`[v0]null[vout]`);
      } else {
        // Chain crossfades: v0 xfade v1 -> tmp0, tmp0 xfade v2 -> tmp1, etc.
        let prevLabel = "v0";
        for (let i = 1; i < clipCount; i++) {
          const outLabel = i === clipCount - 1 ? "vmerged" : `tmp${i - 1}`;
          // Calculate offset: each clip is ~5s, crossfade starts 0.5s before end
          const offset = i * 5 - CROSSFADE_DURATION * i;
          filters.push(
            `[${prevLabel}][v${i}]xfade=transition=fade:duration=${CROSSFADE_DURATION}:offset=${offset}[${outLabel}]`
          );
          prevLabel = outLabel;
        }

        // Add text overlays (one per clip, timed to appear during each segment)
        let lastLabel = "vmerged";
        for (let i = 0; i < Math.min(textOverlays.length, clipCount); i++) {
          const text = textOverlays[i]?.replace(/'/g, "\\'") ?? "";
          if (!text) continue;
          const drawStart = i * (5 - CROSSFADE_DURATION) + 0.5;
          const drawEnd = drawStart + 3.5;
          const outLabel = i === Math.min(textOverlays.length, clipCount) - 1 ? "vout" : `txt${i}`;
          filters.push(
            `[${lastLabel}]drawtext=text='${text}':fontsize=48:fontcolor=white:` +
            `borderw=3:bordercolor=black:x=(w-tw)/2:y=h-h/4:` +
            `enable='between(t,${drawStart},${drawEnd})'[${outLabel}]`
          );
          lastLabel = outLabel;
        }

        // If no text overlays were applied, just pass through
        if (lastLabel === "vmerged") {
          filters.push(`[vmerged]null[vout]`);
        }
      }

      // Audio: concatenate clip audio, mix with music
      const audioInputs = Array.from({ length: clipCount }, (_, i) => `[${i}:a]`).join("");
      filters.push(
        `${audioInputs}concat=n=${clipCount}:v=0:a=1[aclips]`
      );

      if (hasMusicFile) {
        const musicIdx = clipCount;
        filters.push(
          `[${musicIdx}:a]volume=${MUSIC_VOLUME}[amusic]`,
          `[aclips][amusic]amix=inputs=2:duration=shortest[aout]`
        );
      } else {
        filters.push(`[aclips]anull[aout]`);
      }

      command
        .complexFilter(filters, ["vout", "aout"])
        .outputOptions([
          "-map", "[vout]",
          "-map", "[aout]",
          "-c:v", "libx264",
          "-preset", "fast",
          "-crf", "23",
          "-c:a", "aac",
          "-b:a", "128k",
          "-movflags", "+faststart",
          "-fs", "50M", // Max 50MB file size
        ])
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", (err: Error) => reject(err))
        .run();
    });

    // Read the output file
    const outputBuffer = readFileSync(outputPath);

    // Upload to Supabase
    const storagePath = `${userId}/${listingId}/reels/day-${dayNumber}.mp4`;
    const { error: uploadError } = await supabase.storage
      .from("generated-content")
      .upload(storagePath, outputBuffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Final video upload failed: ${uploadError.message}`);
    }

    // Calculate approximate duration
    const numClips = localClips.length;
    const totalDuration =
      numClips * 5 - (numClips - 1) * CROSSFADE_DURATION;

    const elapsed = Date.now() - startTime;

    // Log cost ($0 for self-hosted FFmpeg)
    await supabase.from("cost_logs").insert({
      listing_id: listingId,
      content_piece_id: pieceId,
      service: "transloadit", // using schema's allowed service enum for video processing
      endpoint: "self-hosted:ffmpeg-stitch",
      cost_usd: 0,
      response_time_ms: elapsed,
      success: true,
    });

    return { outputPath: storagePath, durationSeconds: totalDuration };
  } finally {
    // Clean up temp files
    cleanupDir(workDir);
  }
}

function cleanupDir(dir: string): void {
  try {
    const { readdirSync, rmSync } = require("fs");
    if (existsSync(dir)) {
      for (const file of readdirSync(dir)) {
        try {
          unlinkSync(join(dir, file));
        } catch {
          // ignore cleanup errors
        }
      }
      rmSync(dir, { recursive: true, force: true });
    }
  } catch {
    // ignore cleanup errors
  }
}
