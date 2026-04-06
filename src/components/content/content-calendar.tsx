"use client";

import { useState } from "react";
import { PreviewModal } from "./preview-modal";

type CalendarPiece = {
  id: string;
  day_number: number;
  content_type: string;
  platform: string;
  status: string;
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

type ContentCalendarProps = {
  pieces: CalendarPiece[];
  listingAddress: string;
};

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  post: { icon: "🖼", color: "bg-blue-50 text-blue-700 border-blue-200" },
  reel: { icon: "🎬", color: "bg-purple-50 text-purple-700 border-purple-200" },
  story: { icon: "📱", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

export function ContentCalendar({ pieces, listingAddress }: ContentCalendarProps) {
  const [selectedPiece, setSelectedPiece] = useState<CalendarPiece | null>(null);

  return (
    <>
      {/* Calendar grid — 7 columns on desktop, 2 on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {pieces.map((piece) => {
          const typeInfo = TYPE_ICONS[piece.content_type] ?? TYPE_ICONS.post;
          const isComplete = piece.status === "complete";
          const isFailed = piece.status === "failed";
          const downloadFilename = `day${String(piece.day_number).padStart(2, "0")}-${piece.content_type}${
            piece.asset_type === "video" ? ".mp4" : ".png"
          }`;

          return (
            <div
              key={piece.id}
              className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all ${
                isFailed
                  ? "border-red-200 bg-red-50/50"
                  : isComplete
                    ? "border-sage/20 bg-white hover:border-sage hover:shadow-md"
                    : "border-gray-200 bg-gray-50"
              }`}
            >
              {/* Thumbnail area */}
              <button
                onClick={() => isComplete && setSelectedPiece(piece)}
                disabled={!isComplete}
                className="relative aspect-square w-full overflow-hidden bg-gray-100"
              >
                {piece.asset_url && isComplete ? (
                  piece.asset_type === "video" ? (
                    <>
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                        <span className="text-3xl">🎬</span>
                      </div>
                      {/* Play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
                          <svg className="ml-0.5 h-5 w-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={piece.asset_url}
                      alt={`Day ${piece.day_number}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {isFailed ? (
                      <svg className="h-8 w-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    ) : (
                      <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
                    )}
                  </div>
                )}
              </button>

              {/* Card info */}
              <div className="flex flex-1 flex-col justify-between p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black">
                    Day {piece.day_number}
                  </span>
                  <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${typeInfo.color}`}>
                    {piece.content_type}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {piece.recommended_time}
                  </span>
                  {isComplete && piece.asset_path && (
                    <a
                      href={`/api/download?path=${encodeURIComponent(piece.asset_path)}&name=${encodeURIComponent(downloadFilename)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded p-0.5 text-gray-400 transition-colors hover:bg-sage/10 hover:text-sage-darker"
                      title="Download"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              {isFailed && (
                <div className="absolute right-1.5 top-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  Failed
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview modal */}
      {selectedPiece && (
        <PreviewModal
          piece={selectedPiece}
          onClose={() => setSelectedPiece(null)}
          listingAddress={listingAddress}
        />
      )}
    </>
  );
}
