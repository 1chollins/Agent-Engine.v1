import ffmpeg from "fluent-ffmpeg";
import { createServiceClient } from "@/lib/supabase/server";
import { selectMusicTrack } from "./music";
import { join } from "path";
import { mkdirSync, existsSync, writeFileSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = 1920;
const FPS = 30;

// Cuts land on the beat of the selected track. Holds are whole bars (4 beats)
// so the rhythm sits on the phrasing of the music — an arbitrary 7-beat hold
// still lands on a beat but reads as a stumble. Largest that fits wins.
const PREFERRED_BEATS_PER_CUT = [8, 4];

// Hard cuts on the beat are what make a reel read as "edited" rather than as a
// slideshow. A crossfade smears the cut across the downbeat and kills that.
// Set > 0 only if you deliberately want the softer look.
const TRANSITION_DURATION = 0;

const AUDIO_FADE_IN = 0.3;
const AUDIO_FADE_OUT = 1.5;
const VIDEO_FADE_OUT = 0.5;

// Instagram/Facebook Reels overlay their own UI across the bottom ~15% of the
// frame, so captions sit above that line.
const TEXT_BASELINE = 0.66;
const TEXT_FADE = 0.25;

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
 * Reads the true duration of a media file. The generator returns clips that are
 * only approximately the requested length, so every downstream timing decision
 * has to be based on a measurement rather than an assumption.
 */
function probeDuration(path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, data) => {
      if (err) return reject(err);
      const d = data?.format?.duration;
      if (typeof d !== "number" || !isFinite(d) || d <= 0) {
        return reject(new Error(`Could not read duration for ${path}`));
      }
      resolve(d);
    });
  });
}

/**
 * Chooses a single hold length, in whole beats, that every shot will use.
 *
 * A uniform hold gives the reel an even rhythm, and quantising it to the beat
 * means each cut lands on the music instead of drifting against it. The hold is
 * additionally snapped to a whole frame, because ffmpeg encodes whole frames
 * and the leftover fractions would otherwise accumulate across the reel.
 */
export function planBeatCuts(
  clipDurations: number[],
  bpm: number
): { segmentDuration: number; totalDuration: number } {
  const beat = 60 / bpm;
  const shortest = Math.min(...clipDurations);

  // Never ask for more footage than the shortest clip actually has.
  let beats = PREFERRED_BEATS_PER_CUT.find((b) => b * beat <= shortest);
  if (!beats) beats = Math.max(1, Math.floor(shortest / beat));

  let segment = beats * beat;

  // If even a single beat overruns the shortest clip, fall back to the clip
  // itself rather than trimming past its end.
  if (segment > shortest) segment = shortest;

  const segmentFrames = Math.max(1, Math.round(segment * FPS));
  segment = segmentFrames / FPS;

  return {
    segmentDuration: segment,
    totalDuration: segment * clipDurations.length,
  };
}

/**
 * Escapes a string for use inside an ffmpeg drawtext filter argument.
 */
function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "’") // curly apostrophe dodges quoting entirely
    .replace(/:/g, "\\:")
    .replace(/%/g, "\\%");
}

/**
 * drawtext has no auto-fit, so size is estimated from glyph count. Without this
 * a long phrase runs off the side of the frame.
 */
function fitFontSize(text: string, base: number, maxWidth: number): number {
  if (!text) return base;
  // Slightly pessimistic per-glyph width so long phrases keep a real margin
  // rather than kissing the frame edge.
  const estimated = text.length * 0.58;
  return Math.max(28, Math.round(Math.min(base, maxWidth / estimated)));
}

/**
 * Stitches video clips into a single reel with beat-synced hard cuts,
 * text overlays, and background music.
 */
export async function stitchReelVideo(
  options: StitchOptions
): Promise<StitchResult> {
  const {
    clipPaths,
    textOverlays,
    listingId,
    pieceId,
    userId,
    dayNumber,
    brandTone,
  } = options;
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

    if (localClips.length === 0) {
      throw new Error("No clips supplied to stitchReelVideo");
    }

    // Measure what we actually got back from the generator.
    const durations = await Promise.all(localClips.map(probeDuration));

    // Seeded so the days of one package get different tracks, and so a
    // re-render of the same day reproduces the same reel.
    const music = selectMusicTrack(brandTone, `${listingId}-${dayNumber}`);
    const hasMusicFile = existsSync(music.path);

    const { segmentDuration, totalDuration } = planBeatCuts(
      durations,
      music.bpm
    );

    const outputPath = join(workDir, "output.mp4");

    await new Promise<void>((resolve, reject) => {
      let command = ffmpeg();

      for (const clip of localClips) {
        command = command.input(clip);
      }

      // The music bed is the reel's only audio. The clips are generated from
      // stills, so their audio tracks are silent at best and absent at worst —
      // mixing them in previously made the filter graph fail whenever a clip
      // came back without an audio stream.
      if (hasMusicFile) {
        command = command.input(music.path);
      } else {
        command = command.input("anullsrc=r=44100:cl=stereo").inputFormat("lavfi");
      }
      const audioIdx = localClips.length;

      const filters: string[] = [];
      const clipCount = localClips.length;

      // Trim each clip to the beat-locked hold, then fill the frame.
      // `increase` + crop fills 1080x1920; the previous `decrease` + pad
      // letterboxed every non-vertical clip with black bars.
      for (let i = 0; i < clipCount; i++) {
        filters.push(
          `[${i}:v]trim=0:${segmentDuration.toFixed(3)},setpts=PTS-STARTPTS,` +
            `scale=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:force_original_aspect_ratio=increase,` +
            `crop=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT},` +
            `setsar=1,fps=${FPS}[v${i}]`
        );
      }

      let videoLabel: string;
      if (clipCount === 1) {
        filters.push(`[v0]null[vcat]`);
        videoLabel = "vcat";
      } else if (TRANSITION_DURATION > 0) {
        let prevLabel = "v0";
        for (let i = 1; i < clipCount; i++) {
          const outLabel = i === clipCount - 1 ? "vcat" : `tmp${i - 1}`;
          const offset = i * (segmentDuration - TRANSITION_DURATION);
          filters.push(
            `[${prevLabel}][v${i}]xfade=transition=fade:` +
              `duration=${TRANSITION_DURATION}:offset=${offset.toFixed(3)}[${outLabel}]`
          );
          prevLabel = outLabel;
        }
        videoLabel = "vcat";
      } else {
        const inputs = Array.from({ length: clipCount }, (_, i) => `[v${i}]`).join("");
        filters.push(`${inputs}concat=n=${clipCount}:v=1:a=0[vcat]`);
        videoLabel = "vcat";
      }

      // Text overlays — one phrase per shot, held for that shot.
      const overlayCount = Math.min(textOverlays.length, clipCount);
      const baseFont = Math.round(OUTPUT_HEIGHT * 0.046);
      const marginX = Math.round(OUTPUT_WIDTH * 0.08);
      const available = OUTPUT_WIDTH - marginX * 2;
      const baselineY = Math.round(OUTPUT_HEIGHT * TEXT_BASELINE);

      for (let i = 0; i < overlayCount; i++) {
        const raw = textOverlays[i];
        if (!raw) continue;
        const text = escapeDrawtext(raw);
        const start = i * segmentDuration + 0.2;
        const end = (i + 1) * segmentDuration - 0.2;
        if (end <= start) continue;

        const fontSize = fitFontSize(raw, baseFont, available);

        // A soft scrim keeps white type legible over a bright kitchen or a sky.
        const scrimLabel = `scr${i}`;
        const scrimHeight = Math.round(OUTPUT_HEIGHT * 0.26);
        filters.push(
          `[${videoLabel}]drawbox=x=0:y=${OUTPUT_HEIGHT - scrimHeight}:` +
            `w=${OUTPUT_WIDTH}:h=${scrimHeight}:color=black@0.30:t=fill:` +
            `enable='between(t,${start.toFixed(3)},${end.toFixed(3)})'[${scrimLabel}]`
        );
        videoLabel = scrimLabel;

        // Fade the type in and out instead of snapping it on.
        const alpha =
          `if(lt(t,${start.toFixed(3)}),0,` +
          `if(lt(t,${(start + TEXT_FADE).toFixed(3)}),(t-${start.toFixed(3)})/${TEXT_FADE},` +
          `if(lt(t,${(end - TEXT_FADE).toFixed(3)}),1,` +
          `if(lt(t,${end.toFixed(3)}),(${end.toFixed(3)}-t)/${TEXT_FADE},0))))`;

        const textLabel = `txt${i}`;
        filters.push(
          `[${videoLabel}]drawtext=text='${text}':` +
            `fontsize=${fontSize}:fontcolor=white:` +
            `shadowcolor=black@0.55:shadowx=0:shadowy=2:` +
            `x=${marginX}:y=${baselineY}:` +
            `alpha='${alpha}'[${textLabel}]`
        );
        videoLabel = textLabel;
      }

      filters.push(
        `[${videoLabel}]fade=t=out:` +
          `st=${Math.max(0, totalDuration - VIDEO_FADE_OUT).toFixed(3)}:` +
          `d=${VIDEO_FADE_OUT},format=yuv420p[vout]`
      );

      // Music runs at full level and is faded at both ends. Previously it sat
      // at 30% underneath silent clip audio, which is why reels came out quiet.
      filters.push(
        `[${audioIdx}:a]atrim=0:${totalDuration.toFixed(3)},asetpts=N/SR/TB,` +
          `afade=t=in:st=0:d=${AUDIO_FADE_IN},` +
          `afade=t=out:st=${Math.max(0, totalDuration - AUDIO_FADE_OUT).toFixed(3)}:` +
          `d=${AUDIO_FADE_OUT}[aout]`
      );

      command
        .complexFilter(filters, ["vout", "aout"])
        .outputOptions([
          "-map", "[vout]",
          "-map", "[aout]",
          "-t", totalDuration.toFixed(3),
          "-c:v", "libx264",
          "-preset", "medium",
          "-crf", "21",
          "-profile:v", "high",
          "-pix_fmt", "yuv420p",
          "-maxrate", "8M",
          "-bufsize", "12M",
          "-c:a", "aac",
          "-b:a", "192k",
          "-ar", "48000",
          "-movflags", "+faststart",
        ])
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", (err: Error) => reject(err))
        .run();
    });

    const outputBuffer = readFileSync(outputPath);

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

    // Report what was actually written, not what was intended.
    let measuredDuration = totalDuration;
    try {
      measuredDuration = await probeDuration(outputPath);
    } catch {
      // fall back to the planned duration
    }

    const elapsed = Date.now() - startTime;

    await supabase.from("cost_logs").insert({
      listing_id: listingId,
      content_piece_id: pieceId,
      service: "creatomate",
      endpoint: "self-hosted:ffmpeg-stitch",
      cost_usd: 0,
      response_time_ms: elapsed,
      success: true,
    });

    return { outputPath: storagePath, durationSeconds: measuredDuration };
  } finally {
    cleanupDir(workDir);
  }
}

function cleanupDir(dir: string): void {
  try {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  } catch {
    // ignore cleanup errors
  }
}
