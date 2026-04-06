import { createServiceClient } from "@/lib/supabase/server";

/**
 * Downloads a file from Supabase Storage and returns it as a base64 string.
 * Returns null if the file doesn't exist or can't be downloaded.
 */
export async function downloadAsBase64(
  bucket: string,
  path: string
): Promise<{ base64: string; mimeType: string } | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) {
    console.error(`Failed to download ${bucket}/${path}:`, error);
    return null;
  }

  const arrayBuffer = await data.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = data.type || guessMimeType(path);

  return { base64, mimeType };
}

/**
 * Loads the listing photo for a content piece.
 * Uses the first source_photo_id to find the photo record, then downloads it.
 */
export async function loadListingPhoto(
  listingId: string,
  sourcePhotoIds: string[] | null
): Promise<{ base64: string; mimeType: string } | null> {
  if (!sourcePhotoIds || sourcePhotoIds.length === 0) return null;

  const supabase = createServiceClient();
  const { data: photo } = await supabase
    .from("listing_photos")
    .select("file_path, mime_type")
    .eq("id", sourcePhotoIds[0])
    .single();

  if (!photo) return null;

  return downloadAsBase64("listing-photos", photo.file_path);
}

/**
 * Loads the agent's headshot from brand-assets bucket.
 */
export async function loadBrandAsset(
  path: string
): Promise<{ base64: string; mimeType: string } | null> {
  return downloadAsBase64("brand-assets", path);
}

function guessMimeType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
  };
  return mimeMap[ext ?? ""] ?? "image/jpeg";
}
