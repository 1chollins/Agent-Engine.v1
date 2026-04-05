"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type ImageUploadProps = {
  label: string;
  name: string;
  bucket: string;
  storagePath: string;
  accept: string;
  currentPath?: string | null;
  onUploaded: (path: string) => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageUpload({
  label,
  name,
  bucket,
  storagePath,
  accept,
  currentPath,
  onUploaded,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      if (file.size > MAX_FILE_SIZE) {
        setError("File must be under 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("File must be an image");
        return;
      }

      setPreview(URL.createObjectURL(file));
      setUploading(true);

      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop();
        const path = `${storagePath}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: true });

        if (uploadError) {
          setError(uploadError.message);
          return;
        }

        onUploaded(path);
      } catch {
        setError("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [bucket, storagePath, onUploaded]
  );

  const previewSrc = preview || (currentPath ? getPublicUrl(bucket, currentPath) : null);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-sage p-6 hover:border-sage-darker"
      >
        {previewSrc ? (
          <Image
            src={previewSrc}
            alt={`${name} preview`}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="text-center text-sm text-gray-500">
            Click to upload
          </div>
        )}
        {uploading && (
          <p className="mt-2 text-xs text-sage-darker">Uploading...</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
