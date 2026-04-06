import RunwayML from "@runwayml/sdk";
import { createServiceClient } from "@/lib/supabase/server";

const runway = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY! });

// Gen-3 Alpha Turbo pricing: ~$0.05 per second of video
const COST_PER_SECOND = 0.05;
const CLIP_DURATION: 5 | 10 = 5;
const MAX_CONCURRENT = 5;
const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 120; // 10 minutes max wait

export type ClipGenerationResult = {
  clipIndex: number;
  localPath: string;
  durationSeconds: number;
};

/**
 * Generates video clips for a single reel using Runway Gen-3 Alpha Turbo.
 * Each clip is generated from a listing photo with a motion prompt.
 * Returns paths to downloaded clip files in temp storage.
 */
export async function generateReelClips(
  photoUrls: string[],
  motionPrompts: string[],
  listingId: string,
  pieceId: string
): Promise<{ clips: ClipGenerationResult[]; errors: string[] }> {
  const supabase = createServiceClient();
  const clips: ClipGenerationResult[] = [];
  const errors: string[] = [];

  // Process clips with concurrency limit
  const batches = chunkArray(
    photoUrls.map((url, i) => ({ url, prompt: motionPrompts[i] ?? "Slow cinematic pan", index: i })),
    MAX_CONCURRENT
  );

  for (const batch of batches) {
    const results = await Promise.allSettled(
      batch.map((item) =>
        generateSingleClip(item.url, item.prompt, item.index, listingId, pieceId, supabase)
      )
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        clips.push(result.value);
      } else {
        errors.push(result.reason?.message ?? "Unknown clip generation error");
      }
    }
  }

  return { clips, errors };
}

async function generateSingleClip(
  photoUrl: string,
  motionPrompt: string,
  clipIndex: number,
  listingId: string,
  pieceId: string,
  supabase: ReturnType<typeof createServiceClient>
): Promise<ClipGenerationResult> {
  const startTime = Date.now();

  try {
    // Submit the generation task
    const task = await runway.imageToVideo.create({
      model: "gen3a_turbo",
      promptImage: photoUrl,
      promptText: motionPrompt,
      duration: CLIP_DURATION,
      ratio: "768:1280", // Vertical for reels
    });

    const taskId = task.id;

    // Poll for completion
    let attempts = 0;
    while (attempts < MAX_POLL_ATTEMPTS) {
      const status = await runway.tasks.retrieve(taskId);

      if (status.status === "SUCCEEDED") {
        const outputUrl = status.output[0];
        if (!outputUrl) throw new Error("No output URL in succeeded task");

        // Download the video immediately (URLs expire in 24-48h)
        const videoResponse = await fetch(outputUrl);
        if (!videoResponse.ok) {
          throw new Error(`Failed to download clip: ${videoResponse.status}`);
        }
        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

        // Upload to Supabase Storage as a temp clip
        const clipPath = `${listingId}/temp-clips/${pieceId}/clip-${clipIndex}.mp4`;
        const { error: uploadError } = await supabase.storage
          .from("generated-content")
          .upload(clipPath, videoBuffer, {
            contentType: "video/mp4",
            upsert: true,
          });

        if (uploadError) throw new Error(`Clip upload failed: ${uploadError.message}`);

        const elapsed = Date.now() - startTime;
        const cost = CLIP_DURATION * COST_PER_SECOND;

        await supabase.from("cost_logs").insert({
          listing_id: listingId,
          content_piece_id: pieceId,
          service: "runway",
          endpoint: `imageToVideo:gen3a_turbo:clip-${clipIndex}`,
          cost_usd: cost,
          response_time_ms: elapsed,
          success: true,
        });

        return {
          clipIndex,
          localPath: clipPath,
          durationSeconds: CLIP_DURATION,
        };
      }

      if (status.status === "FAILED") {
        const failMsg = "failure" in status ? status.failure : "Unknown failure";
        throw new Error(`Runway task failed: ${failMsg}`);
      }

      if (status.status === "CANCELLED") {
        throw new Error("Runway task was cancelled");
      }

      // Still PENDING, THROTTLED, or RUNNING — wait and retry
      await sleep(POLL_INTERVAL_MS);
      attempts++;
    }

    throw new Error("Runway task timed out after max poll attempts");
  } catch (err) {
    const elapsed = Date.now() - startTime;
    const message = err instanceof Error ? err.message : "Unknown error";

    await supabase.from("cost_logs").insert({
      listing_id: listingId,
      content_piece_id: pieceId,
      service: "runway",
      endpoint: `imageToVideo:gen3a_turbo:clip-${clipIndex}`,
      cost_usd: 0,
      response_time_ms: elapsed,
      success: false,
      error_message: message,
    });

    throw err;
  }
}

/**
 * Creates signed URLs for listing photos so Runway can access them.
 * Runway requires HTTPS URLs for promptImage.
 */
export async function getPhotoSignedUrls(
  listingId: string,
  photoIds: string[]
): Promise<string[]> {
  const supabase = createServiceClient();
  const urls: string[] = [];

  for (const photoId of photoIds) {
    const { data: photo } = await supabase
      .from("listing_photos")
      .select("file_path")
      .eq("id", photoId)
      .single();

    if (!photo) continue;

    const { data: signedUrl } = await supabase.storage
      .from("listing-photos")
      .createSignedUrl(photo.file_path, 3600); // 1 hour expiry

    if (signedUrl?.signedUrl) {
      urls.push(signedUrl.signedUrl);
    }
  }

  return urls;
}

// Default motion prompts for real estate videos
export const REEL_MOTION_PROMPTS = [
  "Slow cinematic dolly forward through a bright, welcoming room. Steady and smooth.",
  "Gentle aerial-style pan revealing the exterior and landscaping. Golden hour lighting.",
  "Smooth tracking shot moving through the kitchen. Focus on countertops and natural light.",
  "Slow pan across the living space highlighting architectural details and open floor plan.",
  "Cinematic pull-back reveal of the full property exterior. Blue sky and lush surroundings.",
];

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
