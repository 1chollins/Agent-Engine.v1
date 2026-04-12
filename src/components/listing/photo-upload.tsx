"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { MIN_PHOTOS, MAX_PHOTOS, MAX_PHOTO_SIZE } from "@/types/listing";
import type { ListingPhoto } from "@/types/listing";

type PhotoUploadProps = {
  listingId: string;
  userId: string;
  initialPhotos: ListingPhoto[];
  onPhotosChanged?: () => void;
};

type LocalPhoto = ListingPhoto & { previewUrl?: string };

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic"];

export function PhotoUpload({
  listingId,
  userId,
  initialPhotos,
  onPhotosChanged,
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<LocalPhoto[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [verticalOpen, setVerticalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const verticalInputRef = useRef<HTMLInputElement>(null);

  // Generate signed URLs for initial photos loaded from DB (private bucket)
  useEffect(() => {
    const needsSigning = initialPhotos.filter((p) => !p.previewUrl);
    if (needsSigning.length === 0) return;

    const supabase = createClient();

    Promise.all(
      needsSigning.map(async (photo) => {
        try {
          const { data } = await supabase.storage
            .from("listing-photos")
            .createSignedUrl(photo.file_path, 3600);
          return { id: photo.id, signedUrl: data?.signedUrl ?? null };
        } catch (err) {
          console.error(`Failed to sign URL for photo ${photo.id}:`, err);
          return { id: photo.id, signedUrl: null };
        }
      })
    ).then((results) => {
      const urlMap = new Map(
        results.filter((r) => r.signedUrl).map((r) => [r.id, r.signedUrl!])
      );
      setPhotos((prev) =>
        prev.map((p) =>
          !p.previewUrl && urlMap.has(p.id)
            ? { ...p, previewUrl: urlMap.get(p.id)! }
            : p
        )
      );
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);
      const remaining = MAX_PHOTOS - photos.length;

      if (fileArray.length > remaining) {
        setError(`Can only add ${remaining} more photo${remaining === 1 ? "" : "s"} (max ${MAX_PHOTOS})`);
        return;
      }

      const invalid = fileArray.filter((f) => !ACCEPTED_TYPES.includes(f.type));
      if (invalid.length > 0) {
        setError("Only JPG, PNG, and HEIC files are accepted");
        return;
      }

      const tooLarge = fileArray.filter((f) => f.size > MAX_PHOTO_SIZE);
      if (tooLarge.length > 0) {
        setError(`${tooLarge.length} file(s) exceed 25MB limit`);
        return;
      }

      setUploading(true);
      const supabase = createClient();
      const newPhotos: LocalPhoto[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const sortOrder = photos.length + i;
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${userId}/${listingId}/${fileName}`;

        setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }));

        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(filePath, file, { upsert: false });

        if (uploadError) {
          setError(`Failed to upload ${file.name}: ${uploadError.message}`);
          setUploadProgress((prev) => ({ ...prev, [fileName]: -1 }));
          continue;
        }

        setUploadProgress((prev) => ({ ...prev, [fileName]: 100 }));

        // Save photo record
        const { data, error: dbError } = await supabase
          .from("listing_photos")
          .insert({
            listing_id: listingId,
            file_path: filePath,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            sort_order: sortOrder,
            is_hero: photos.length === 0 && i === 0,
          })
          .select()
          .single();

        if (dbError) {
          setError(`Failed to save ${file.name}: ${dbError.message}`);
          continue;
        }

        // Fire-and-forget: detect orientation server-side
        fetch("/api/photos/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo_id: data.id, file_path: filePath }),
        }).catch(() => {});

        newPhotos.push({
          ...data,
          previewUrl: URL.createObjectURL(file),
        });
      }

      setPhotos((prev) => [...prev, ...newPhotos]);
      setUploading(false);
      setUploadProgress({});
      onPhotosChanged?.();
    },
    [photos.length, userId, listingId, onPhotosChanged]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const [verticalDragOver, setVerticalDragOver] = useState(false);

  const handleVerticalDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setVerticalDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const removePhoto = useCallback(
    async (photoId: string, filePath: string) => {
      const supabase = createClient();
      await supabase.storage.from("listing-photos").remove([filePath]);
      await supabase.from("listing_photos").delete().eq("id", photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      onPhotosChanged?.();
    },
    [onPhotosChanged]
  );

  const setHero = useCallback(
    async (photoId: string) => {
      const supabase = createClient();
      // Clear all heroes
      await supabase
        .from("listing_photos")
        .update({ is_hero: false })
        .eq("listing_id", listingId);
      // Set new hero
      await supabase
        .from("listing_photos")
        .update({ is_hero: true })
        .eq("id", photoId);

      setPhotos((prev) =>
        prev.map((p) => ({ ...p, is_hero: p.id === photoId }))
      );
    },
    [listingId]
  );

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOverItem = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === index) return;

      setPhotos((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(dragIndex, 1);
        updated.splice(index, 0, moved);
        return updated;
      });
      setDragIndex(index);
    },
    [dragIndex]
  );

  const handleDragEnd = useCallback(async () => {
    setDragIndex(null);
    // Persist new order
    const supabase = createClient();
    for (let i = 0; i < photos.length; i++) {
      await supabase
        .from("listing_photos")
        .update({ sort_order: i })
        .eq("id", photos[i].id);
    }
  }, [photos]);

  const getPhotoUrl = useCallback((photo: LocalPhoto) => {
    if (photo.previewUrl) return photo.previewUrl;
    const supabase = createClient();
    const { data } = supabase.storage
      .from("listing-photos")
      .getPublicUrl(photo.file_path);
    return data.publicUrl;
  }, []);

  const photoCount = photos.length;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragOver
            ? "border-sage-darker bg-sage/10"
            : "border-sage hover:border-sage-darker"
        }`}
      >
        <p className="text-sm font-medium text-black">
          Drag & drop photos here or click to browse
        </p>
        <p className="mt-1 text-xs text-gray-500">
          JPG, PNG, HEIC — max 25MB each — {MIN_PHOTOS}–{MAX_PHOTOS} photos required
        </p>
        {uploading && (
          <p className="mt-2 text-xs text-sage-darker">Uploading...</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.heic"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress */}
      {Object.entries(uploadProgress).map(([name, pct]) => (
        <div key={name} className="flex items-center gap-2 text-xs">
          <span className="truncate text-gray-600">{name}</span>
          <div className="h-1.5 flex-1 rounded-full bg-gray-200">
            <div
              className={`h-1.5 rounded-full transition-all ${pct < 0 ? "bg-red-400" : "bg-sage"}`}
              style={{ width: `${Math.max(pct, 0)}%` }}
            />
          </div>
          <span className="text-gray-500">{pct < 0 ? "Failed" : `${pct}%`}</span>
        </div>
      ))}

      {/* Photo Count */}
      <div className="flex items-center justify-between text-sm">
        <span className={photoCount < MIN_PHOTOS ? "text-red-600" : "text-gray-600"}>
          {photoCount} / {MAX_PHOTOS} photos
          {photoCount < MIN_PHOTOS && ` (need at least ${MIN_PHOTOS})`}
        </span>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOverItem(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative aspect-square cursor-grab overflow-hidden rounded-lg border-2 ${
                photo.is_hero ? "border-sage-darker" : "border-transparent"
              } ${dragIndex === index ? "opacity-50" : ""}`}
            >
              <Image
                src={getPhotoUrl(photo)}
                alt={photo.file_name}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Hero Badge */}
              {photo.is_hero && (
                <span className="absolute left-1 top-1 rounded bg-sage px-1.5 py-0.5 text-[10px] font-bold text-black">
                  HERO
                </span>
              )}
              {/* Hover Controls */}
              <div className="absolute inset-0 flex items-end justify-center gap-1 bg-black/0 p-1.5 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                {!photo.is_hero && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setHero(photo.id); }}
                    className="rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-black hover:bg-white"
                  >
                    Set Hero
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removePhoto(photo.id, photo.file_path); }}
                  className="rounded bg-red-500/90 px-2 py-1 text-[10px] font-medium text-white hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
              {/* Sort Order */}
              <span className="absolute right-1 top-1 rounded bg-black/50 px-1 py-0.5 text-[10px] text-white">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Vertical Photos (Optional) */}
      <div className="border-t border-sage/10 pt-4">
        {!verticalOpen ? (
          <button
            type="button"
            aria-expanded={false}
            onClick={() => setVerticalOpen(true)}
            className="text-sm font-medium text-sage-darker hover:text-black"
          >
            📱 Add vertical photos (optional)
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-black">
                📱 Vertical Photos
              </p>
              <button
                type="button"
                aria-expanded={true}
                onClick={() => setVerticalOpen(false)}
                className="text-xs font-medium text-gray-500 hover:text-black"
              >
                Hide
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Upload portrait-oriented photos here (phone shots work great).
              We&apos;ll use these for Stories and Reels. If you don&apos;t add any,
              we&apos;ll use your main photos with a smart background fill.
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setVerticalDragOver(true); }}
              onDragLeave={() => setVerticalDragOver(false)}
              onDrop={handleVerticalDrop}
              onClick={() => verticalInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                verticalDragOver
                  ? "border-sage-darker bg-sage/10"
                  : "border-gray-300 hover:border-sage"
              }`}
            >
              <div className="mb-2 flex h-12 w-8 items-center justify-center rounded border border-gray-300 text-gray-400">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="16" r="1" fill="currentColor" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">
                Drop vertical photos here
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                or click to browse
              </p>
            </div>
            <input
              ref={verticalInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.heic"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
