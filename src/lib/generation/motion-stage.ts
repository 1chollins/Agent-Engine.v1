import { createServiceClient } from "@/lib/supabase/server";
import type { ContentTag } from "@/types/listing";
import { getMotionPrompt } from "./motion-prompts";
import { getCachedClipOrSubmit } from "./clip-cache";
import {
  checkKlingClipStatus,
  finalizeKlingClip,
} from "./kling-render";

export const MAX_KLING_POLL_ATTEMPTS = 200;
export const KLING_POLL_INTERVAL = "10s";

export type ClipWorkItem = {
  photoId: string;
  status: "cached" | "processing" | "submitted" | "failed";
  clipId?: string;
  falRequestId?: string;
  videoUrl?: string;
  error?: string;
};

type ContentPieceRow = {
  content_type: string;
  source_photo_ids: string[] | null;
};

type ListingPhotoRow = {
  id: string;
  content_tag: ContentTag | null;
};

export async function submitAllClips(params: {
  packageId: string;
  listingId: string;
}): Promise<ClipWorkItem[]> {
  const { packageId, listingId } = params;
  const supabase = createServiceClient();

  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("content_type, source_photo_ids")
    .eq("package_id", packageId)
    .in("content_type", ["reel", "story"]);

  const typedPieces = (pieces ?? []) as ContentPieceRow[];

  const photoIdSet = new Set<string>();
  for (const piece of typedPieces) {
    for (const id of piece.source_photo_ids ?? []) {
      if (id) photoIdSet.add(id);
    }
  }
  const uniquePhotoIds = Array.from(photoIdSet);

  if (uniquePhotoIds.length === 0) {
    return [];
  }

  const { data: photos } = await supabase
    .from("listing_photos")
    .select("id, content_tag")
    .in("id", uniquePhotoIds);

  const tagByPhotoId = new Map<string, ContentTag | null>();
  for (const photo of (photos ?? []) as ListingPhotoRow[]) {
    tagByPhotoId.set(photo.id, photo.content_tag ?? null);
  }

  const work: ClipWorkItem[] = [];
  for (const photoId of uniquePhotoIds) {
    const tag = tagByPhotoId.get(photoId) ?? null;
    // Seeded on the photo so each shot in a reel gets a different camera move,
    // while staying stable for the (photo_id, prompt_hash) clip cache.
    const prompt = getMotionPrompt(tag, photoId);
    try {
      const result = await getCachedClipOrSubmit({
        listingId,
        photoId,
        prompt,
      });
      if (result.status === "cached") {
        work.push({
          photoId,
          status: "cached",
          videoUrl: result.videoUrl,
        });
      } else if (result.status === "processing") {
        work.push({
          photoId,
          status: "processing",
          clipId: result.clipId,
          falRequestId: result.falRequestId,
        });
      } else if (result.status === "submitted") {
        work.push({
          photoId,
          status: "submitted",
          clipId: result.clipId,
          falRequestId: result.falRequestId,
        });
      } else {
        work.push({ photoId, status: "failed", error: result.error });
      }
    } catch (err) {
      work.push({ photoId, status: "failed", error: String(err) });
    }
  }

  return work;
}

export async function checkAndFinalizePending(
  pending: ClipWorkItem[]
): Promise<ClipWorkItem[]> {
  const supabase = createServiceClient();
  const stillPending: ClipWorkItem[] = [];

  for (const item of pending) {
    if (!item.clipId || !item.falRequestId) {
      continue;
    }
    try {
      const { status, errorMessage } = await checkKlingClipStatus(
        item.falRequestId
      );

      if (status === "completed") {
        await finalizeKlingClip(item.clipId, item.falRequestId);
        continue;
      }

      if (status === "failed") {
        await supabase
          .from("kling_clips")
          .update({
            status: "failed",
            error_message: errorMessage ?? "Kling render failed",
          })
          .eq("id", item.clipId);
        continue;
      }

      stillPending.push(item);
    } catch (err) {
      console.error(
        `checkAndFinalizePending error for clip ${item.clipId}:`,
        err
      );
      stillPending.push(item);
    }
  }

  return stillPending;
}

export async function logClipOutcomes(listingId: string): Promise<void> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("kling_clips")
    .select("status")
    .eq("listing_id", listingId);

  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { status: string }[]) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  console.log(
    `Kling clip outcomes for listing ${listingId}:`,
    JSON.stringify(counts)
  );
}
