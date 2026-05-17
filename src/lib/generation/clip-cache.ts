import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { getPhotoSignedUrls } from "./video-clips";
import { startKlingClip, pollKlingClip } from "./kling-render";

// Duration and model are constants in v1, so only the prompt is hashed.
// If duration becomes configurable, fold it into the hash input.
export function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex");
}

type GetOrRenderParams = {
  listingId: string;
  photoId: string;
  prompt: string;
};

type GetOrRenderResult = {
  videoUrl: string;
  cached: boolean;
};

type KlingClipRow = {
  id: string;
  status: "pending" | "processing" | "complete" | "failed";
  fal_request_id: string | null;
  video_url: string | null;
};

// Concurrency contract:
// - Callers MUST NOT invoke getOrRenderClip concurrently for the same
//   (photoId, prompt) pair. Two concurrent first-time calls both miss the
//   cache SELECT and both submit a Kling render — a double charge.
// - Sequential repeats (retries, cross-package reuse) are safe — they hit
//   the existing complete/processing row.
// - Phase 4 must dedupe its render work list to unique (photoId, prompt)
//   pairs before fan-out.
export async function getOrRenderClip(
  params: GetOrRenderParams
): Promise<GetOrRenderResult> {
  const { listingId, photoId, prompt } = params;
  const supabase = createServiceClient();
  const promptHash = hashPrompt(prompt);

  const { data: existing } = await supabase
    .from("kling_clips")
    .select("id, status, fal_request_id, video_url")
    .eq("photo_id", photoId)
    .eq("prompt_hash", promptHash)
    .maybeSingle();

  const existingRow = existing as KlingClipRow | null;

  if (
    existingRow &&
    existingRow.status === "complete" &&
    existingRow.video_url
  ) {
    return { videoUrl: existingRow.video_url, cached: true };
  }

  if (
    existingRow &&
    existingRow.status === "processing" &&
    existingRow.fal_request_id
  ) {
    try {
      const videoUrl = await pollKlingClip({
        clipId: existingRow.id,
        falRequestId: existingRow.fal_request_id,
      });
      return { videoUrl, cached: false };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await supabase
        .from("kling_clips")
        .update({ status: "failed", error_message: message })
        .eq("id", existingRow.id);
      throw err;
    }
  }

  const { data: upserted, error: upsertError } = await supabase
    .from("kling_clips")
    .upsert(
      {
        listing_id: listingId,
        photo_id: photoId,
        prompt,
        prompt_hash: promptHash,
        status: "pending",
        fal_request_id: null,
        video_url: null,
        error_message: null,
        cost_usd: null,
        completed_at: null,
      },
      { onConflict: "photo_id,prompt_hash" }
    )
    .select("id")
    .single();

  if (upsertError || !upserted) {
    throw new Error(
      `Failed to upsert kling_clips row: ${upsertError?.message ?? "no row returned"}`
    );
  }

  const clipId = (upserted as { id: string }).id;

  const signedUrls = await getPhotoSignedUrls(listingId, [photoId]);
  const imageUrl = signedUrls[0];
  if (!imageUrl) {
    await supabase
      .from("kling_clips")
      .update({
        status: "failed",
        error_message: "No signed URL available for photo",
      })
      .eq("id", clipId);
    throw new Error(`No signed URL available for photo ${photoId}`);
  }

  try {
    const { falRequestId } = await startKlingClip({
      clipId,
      imageUrl,
      prompt,
    });
    const videoUrl = await pollKlingClip({ clipId, falRequestId });
    return { videoUrl, cached: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await supabase
      .from("kling_clips")
      .update({ status: "failed", error_message: message })
      .eq("id", clipId);
    throw err;
  }
}

export type CachedClipOrSubmitResult =
  | { status: "cached"; videoUrl: string }
  | { status: "processing"; clipId: string; falRequestId: string }
  | { status: "submitted"; clipId: string; falRequestId: string }
  | { status: "failed"; error: string };

// Non-blocking variant of getOrRenderClip: hits cache, returns a fal request
// handle for the orchestrator to poll across Inngest steps. Same concurrency
// contract as getOrRenderClip — callers must dedupe (photoId, prompt) pairs.
export async function getCachedClipOrSubmit(params: {
  listingId: string;
  photoId: string;
  prompt: string;
}): Promise<CachedClipOrSubmitResult> {
  const { listingId, photoId, prompt } = params;
  const supabase = createServiceClient();
  const promptHash = hashPrompt(prompt);

  const { data: existing } = await supabase
    .from("kling_clips")
    .select("id, status, fal_request_id, video_url")
    .eq("photo_id", photoId)
    .eq("prompt_hash", promptHash)
    .maybeSingle();

  const existingRow = existing as KlingClipRow | null;

  if (
    existingRow &&
    existingRow.status === "complete" &&
    existingRow.video_url
  ) {
    return { status: "cached", videoUrl: existingRow.video_url };
  }

  if (
    existingRow &&
    existingRow.status === "processing" &&
    existingRow.fal_request_id
  ) {
    return {
      status: "processing",
      clipId: existingRow.id,
      falRequestId: existingRow.fal_request_id,
    };
  }

  const { data: upserted, error: upsertError } = await supabase
    .from("kling_clips")
    .upsert(
      {
        listing_id: listingId,
        photo_id: photoId,
        prompt,
        prompt_hash: promptHash,
        status: "pending",
        fal_request_id: null,
        video_url: null,
        error_message: null,
        cost_usd: null,
        completed_at: null,
      },
      { onConflict: "photo_id,prompt_hash" }
    )
    .select("id")
    .single();

  if (upsertError || !upserted) {
    throw new Error(
      `Failed to upsert kling_clips row: ${upsertError?.message ?? "no row returned"}`
    );
  }

  const clipId = (upserted as { id: string }).id;

  const signedUrls = await getPhotoSignedUrls(listingId, [photoId]);
  const imageUrl = signedUrls[0];
  if (!imageUrl) {
    const error = `No signed URL available for photo ${photoId}`;
    await supabase
      .from("kling_clips")
      .update({ status: "failed", error_message: error })
      .eq("id", clipId);
    return { status: "failed", error };
  }

  try {
    const { falRequestId } = await startKlingClip({
      clipId,
      imageUrl,
      prompt,
    });
    return { status: "submitted", clipId, falRequestId };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    await supabase
      .from("kling_clips")
      .update({ status: "failed", error_message: error })
      .eq("id", clipId);
    return { status: "failed", error };
  }
}
