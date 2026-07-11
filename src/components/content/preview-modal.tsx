"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CopyButton } from "./copy-button";

type PreviewPiece = {
  id: string;
  day_number: number;
  content_type: string;
  platform: string;
  status: string;
  regen_count: number;
  asset_type: string | null;
  asset_url: string | null;
  asset_alt_url: string | null;
  asset_path: string | null;
  asset_path_alt: string | null;
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

const MAX_REMIXES = 2;

export function PreviewModal({ piece, onClose }: PreviewModalProps) {
  const router = useRouter();
  // Local copy so a caption rewrite shows instantly without a reload.
  const [p, setP] = useState(piece);
  const [direction, setDirection] = useState("");
  const [redoBusy, setRedoBusy] = useState(false);
  const [redoError, setRedoError] = useState<string | null>(null);
  const [remixBusy, setRemixBusy] = useState(false);
  const [remixMsg, setRemixMsg] = useState<string | null>(null);

  async function handleRedo() {
    if (!direction.trim() || redoBusy) return;
    setRedoBusy(true);
    setRedoError(null);
    try {
      const res = await fetch(`/api/pieces/${p.id}/redo-caption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRedoError(data.error || "Rewrite failed");
        return;
      }
      setP((prev) => ({ ...prev, ...data }));
      setDirection("");
      router.refresh();
    } catch {
      setRedoError("Something went wrong — try again.");
    } finally {
      setRedoBusy(false);
    }
  }

  async function handleRemix() {
    if (remixBusy) return;
    setRemixBusy(true);
    setRemixMsg(null);
    try {
      const res = await fetch(`/api/pieces/${p.id}/remix-video`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setRemixMsg(data.error || "Remix failed");
        return;
      }
      setRemixMsg(
        `Remixing with new music and pacing — ready in a couple of minutes. ${data.remixesLeft} remix${data.remixesLeft === 1 ? "" : "es"} left.`
      );
      setP((prev) => ({ ...prev, regen_count: prev.regen_count + 1 }));
      router.refresh();
    } catch {
      setRemixMsg("Something went wrong — try again.");
    } finally {
      setRemixBusy(false);
    }
  }

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

  const dayStr = String(p.day_number).padStart(2, "0");
  const isPost = p.content_type === "post";
  const hasAlt = isPost && p.asset_path_alt;

  function getDownloadUrl(): string {
    if (isPost && hasAlt && p.asset_path && p.asset_path_alt) {
      // Single ZIP with both IG + FB versions
      return `/api/download-post?ig=${encodeURIComponent(p.asset_path)}&fb=${encodeURIComponent(p.asset_path_alt)}&name=day${dayStr}-post`;
    }
    if (p.asset_path) {
      const ext = p.asset_type === "video" ? "mp4" : "png";
      return `/api/download?path=${encodeURIComponent(p.asset_path)}&name=day${dayStr}-${p.content_type}.${ext}`;
    }
    return "#";
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-sage/10 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-black sm:text-lg">
              Day {p.day_number} — {TYPE_LABELS[p.content_type] ?? p.content_type}
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              {p.recommended_time} · {p.platform === "both" ? "Instagram & Facebook" : p.platform}
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {p.asset_type === "video" && p.status === "complete" && (
              <button
                onClick={handleRemix}
                disabled={remixBusy || p.regen_count >= MAX_REMIXES}
                title="Re-render with different music, edit style, and pacing"
                className="inline-flex items-center gap-1.5 rounded-lg border border-sage px-4 py-2 text-sm font-medium text-sage-darker transition-colors hover:bg-sage/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🎬 {remixBusy
                  ? "Queuing…"
                  : p.regen_count >= MAX_REMIXES
                    ? "Remix limit reached"
                    : `Remix video (${MAX_REMIXES - p.regen_count} left)`}
              </button>
            )}
            {p.asset_path && (
              <a
                href={getDownloadUrl()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sage px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-sage-dark"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {hasAlt ? "Download (IG + FB)" : "Download"}
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

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-2">
          {/* Asset preview */}
          <div className="space-y-4">
            {/* Primary asset (IG for posts, main for reels/stories) */}
            {p.asset_type === "video" && p.asset_url ? (
              <div className="rounded-xl bg-gray-50 p-2">
                <video
                  src={p.asset_url}
                  controls
                  className="max-h-[500px] w-full rounded-lg"
                >
                  Your browser does not support video playback.
                </video>
              </div>
            ) : p.asset_url ? (
              <div className="rounded-xl bg-gray-50 p-2">
                {isPost && (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Instagram (1080 x 1080)
                  </p>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.asset_url}
                  alt={`Day ${p.day_number} ${p.content_type}`}
                  className="w-full rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-xl bg-gray-100">
                <p className="text-sm text-gray-400">No asset available</p>
              </div>
            )}

            {/* FB variant for posts — shown below IG */}
            {isPost && p.asset_alt_url && (
              <div className="rounded-xl bg-gray-50 p-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Facebook (1200 x 630)
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.asset_alt_url}
                  alt={`Day ${p.day_number} post — Facebook`}
                  className="w-full rounded-lg object-contain"
                />
              </div>
            )}
          </div>

          {/* Text content */}
          <div className="space-y-4">
            {/* Redo with direction */}
            <div className="rounded-lg border border-sage/25 bg-sage/5 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                ✍️ Not quite right? Tell me what to change
              </h3>
              <div className="mt-2 flex gap-2">
                <input
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRedo()}
                  placeholder="e.g. shorter · highlight the lanai · more luxury"
                  maxLength={300}
                  className="min-w-0 flex-1 rounded-lg border border-sage/30 bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-gray-400 focus:border-sage"
                />
                <button
                  onClick={handleRedo}
                  disabled={redoBusy || !direction.trim()}
                  className="shrink-0 rounded-lg bg-sage px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {redoBusy ? "Rewriting…" : "Rewrite"}
                </button>
              </div>
              {redoError && <p className="mt-2 text-xs text-red-600">{redoError}</p>}
              {remixMsg && <p className="mt-2 text-xs text-sage-darker">{remixMsg}</p>}
              <p className="mt-2 text-[11px] text-gray-400">
                Caption rewrites are unlimited. Video remixes change music, edit
                style, and pacing — {MAX_REMIXES} per piece.
              </p>
            </div>
            {/* Story-specific fields */}
            {p.content_type === "story" && p.story_teaser && (
              <div className="rounded-lg bg-cream p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Story Teaser
                  </h3>
                  <CopyButton text={p.story_teaser} label="Copy" />
                </div>
                <p className="mt-2 text-sm font-medium text-black">{p.story_teaser}</p>
                {p.story_cta && (
                  <p className="mt-1 text-sm text-sage-darker">{p.story_cta}</p>
                )}
              </div>
            )}

            {/* Reel overlay phrases */}
            {p.content_type === "reel" && p.text_overlay && (
              <div className="rounded-lg bg-cream p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Text Overlays
                </h3>
                <ul className="mt-2 space-y-1">
                  {(JSON.parse(p.text_overlay) as string[]).map((phrase, i) => (
                    <li key={i} className="text-sm text-black">
                      {i + 1}. {phrase}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instagram caption */}
            {p.caption_instagram && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Instagram Caption
                  </h3>
                  <CopyButton text={p.caption_instagram} label="Copy" />
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {p.caption_instagram}
                </p>
              </div>
            )}

            {/* Facebook caption */}
            {p.caption_facebook && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Facebook Caption
                  </h3>
                  <CopyButton text={p.caption_facebook} label="Copy" />
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {p.caption_facebook}
                </p>
              </div>
            )}

            {/* Hashtags */}
            {p.hashtags && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Hashtags
                  </h3>
                  <CopyButton text={p.hashtags} label="Copy" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-sage-darker">
                  {p.hashtags}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

