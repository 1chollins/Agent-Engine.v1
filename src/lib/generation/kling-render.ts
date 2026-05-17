import { fal } from "@fal-ai/client";
import { createServiceClient } from "@/lib/supabase/server";

const KLING_MODEL =
  process.env.KLING_MODEL ?? "fal-ai/kling-video/o3/standard/image-to-video";

const CLIP_DURATION = "5";
const CLIP_COST = 0.084 * 5;

type StartParams = {
  clipId: string;
  imageUrl: string;
  prompt: string;
};

type PollParams = {
  clipId: string;
  falRequestId: string;
  maxAttempts?: number;
  intervalMs?: number;
};

export async function startKlingClip(
  params: StartParams
): Promise<{ falRequestId: string }> {
  const { clipId, imageUrl, prompt } = params;
  const supabase = createServiceClient();

  const submitted = await fal.queue.submit(KLING_MODEL, {
    input: {
      image_url: imageUrl,
      prompt,
      duration: CLIP_DURATION,
      generate_audio: false,
    },
  });

  const falRequestId = submitted.request_id;

  await supabase
    .from("kling_clips")
    .update({
      status: "processing",
      fal_request_id: falRequestId,
    })
    .eq("id", clipId);

  return { falRequestId };
}

export async function pollKlingClip(params: PollParams): Promise<string> {
  const {
    clipId,
    falRequestId,
    maxAttempts = 120,
    intervalMs = 5000,
  } = params;
  const supabase = createServiceClient();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    const status = await fal.queue.status(KLING_MODEL, {
      requestId: falRequestId,
    });

    if (status.status === "COMPLETED") {
      const result = await fal.queue.result(KLING_MODEL, {
        requestId: falRequestId,
      });

      const data = result.data as { video?: { url?: string } } | null;
      const videoUrl = data?.video?.url;
      if (!videoUrl) {
        throw new Error("Kling result missing video URL");
      }

      await supabase
        .from("kling_clips")
        .update({
          status: "complete",
          video_url: videoUrl,
          cost_usd: CLIP_COST,
          completed_at: new Date().toISOString(),
        })
        .eq("id", clipId);

      try {
        await supabase.from("cost_logs").insert({
          service: "kling",
          endpoint: "queue:kling-o3-standard",
          cost_usd: CLIP_COST,
          response_time_ms: null,
          success: true,
        });
      } catch (logErr) {
        console.error("Failed to log Kling cost:", logErr);
      }

      return videoUrl;
    }
  }

  throw new Error(
    `Kling render timed out after ${maxAttempts} polls (clip ${clipId})`
  );
}
