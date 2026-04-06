"use client";

import { useEffect, useCallback } from "react";
import { CopyButton } from "./copy-button";

type PreviewPiece = {
  id: string;
  day_number: number;
  content_type: string;
  platform: string;
  status: string;
  asset_type: string | null;
  asset_url: string | null;
  asset_alt_url: string | null;
  caption_instagram: string | null;
  caption_facebook: string | null;
  hashtags: string | null;
  text_overlay: string | null;
  story_teaser: string | null;
  story_cta: string | null;
  recommended_time: string;
};

type PreviewModalProps = {
  piece: PreviewPiece;
  onClose: () => void;
  listingAddress: string;
};

const TYPE_LABELS: Record<string, string> = {
  post: "Static Post",
  reel: "Video Reel",
  story: "Story",
};

export function PreviewModal({ piece, onClose, listingAddress }: PreviewModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const downloadFilename = `day${String(piece.day_number).padStart(2, "0")}-${piece.content_type}${
    piece.asset_type === "video" ? ".mp4" : ".png"
  }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sage/10 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-black">
              Day {piece.day_number} — {TYPE_LABELS[piece.content_type] ?? piece.content_type}
            </h2>
            <p className="text-sm text-gray-500">
              {piece.recommended_time} · {piece.platform === "both" ? "Instagram & Facebook" : piece.platform}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {piece.asset_url && (
              <a
                href={piece.asset_url}
                download={downloadFilename}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sage px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-sage-dark"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          {/* Asset preview */}
          <div className="flex items-center justify-center rounded-xl bg-gray-50 p-2">
            {piece.asset_type === "video" && piece.asset_url ? (
              <video
                src={piece.asset_url}
                controls
                className="max-h-[500px] w-full rounded-lg"
                poster=""
              >
                Your browser does not support video playback.
              </video>
            ) : piece.asset_url ? (
              <img
                src={piece.asset_url}
                alt={`Day ${piece.day_number} ${piece.content_type}`}
                className="max-h-[500px] w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-100">
                <p className="text-sm text-gray-400">No asset available</p>
              </div>
            )}
          </div>

          {/* Text content */}
          <div className="space-y-4">
            {/* Story-specific fields */}
            {piece.content_type === "story" && piece.story_teaser && (
              <div className="rounded-lg bg-cream p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Story Teaser
                  </h3>
                  <CopyButton text={piece.story_teaser} label="Copy" />
                </div>
                <p className="mt-2 text-sm font-medium text-black">{piece.story_teaser}</p>
                {piece.story_cta && (
                  <p className="mt-1 text-sm text-sage-darker">{piece.story_cta}</p>
                )}
              </div>
            )}

            {/* Reel overlay phrases */}
            {piece.content_type === "reel" && piece.text_overlay && (
              <div className="rounded-lg bg-cream p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Text Overlays
                </h3>
                <ul className="mt-2 space-y-1">
                  {(JSON.parse(piece.text_overlay) as string[]).map((phrase, i) => (
                    <li key={i} className="text-sm text-black">
                      {i + 1}. {phrase}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instagram caption */}
            {piece.caption_instagram && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Instagram Caption
                  </h3>
                  <CopyButton text={piece.caption_instagram} label="Copy" />
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {piece.caption_instagram}
                </p>
              </div>
            )}

            {/* Facebook caption */}
            {piece.caption_facebook && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Facebook Caption
                  </h3>
                  <CopyButton text={piece.caption_facebook} label="Copy" />
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {piece.caption_facebook}
                </p>
              </div>
            )}

            {/* Hashtags */}
            {piece.hashtags && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Hashtags
                  </h3>
                  <CopyButton text={piece.hashtags} label="Copy" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-sage-darker">
                  {piece.hashtags}
                </p>
              </div>
            )}

            {/* FB variant download */}
            {piece.asset_alt_url && piece.content_type === "post" && (
              <div className="rounded-lg border border-sage/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Facebook variant (1200x630)</span>
                  <a
                    href={piece.asset_alt_url}
                    download={`day${String(piece.day_number).padStart(2, "0")}-post-fb.png`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-sage-darker hover:text-black"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download FB
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
