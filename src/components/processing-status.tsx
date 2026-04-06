"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type PieceStatus = {
  id: string;
  day_number: number;
  content_type: string;
  status: string;
  error_message: string | null;
  asset_type: string | null;
};

type PackageStatus = {
  id: string;
  status: string;
  total_pieces: number;
  completed_pieces: number;
  failed_pieces: number;
};

type ProcessingStatusProps = {
  packageId: string;
  listingId: string;
  initialPackage: PackageStatus;
  initialPieces: PieceStatus[];
};

const POLL_INTERVAL = 5000;
const AVG_SECONDS_PER_PIECE = 30;

const STAGE_MESSAGES = [
  "Analyzing your listing photos...",
  "Writing captions and hashtags with AI...",
  "Generating branded post images...",
  "Creating story graphics...",
  "Producing video reels...",
  "Adding transitions and music...",
  "Finalizing your content package...",
];

export function ProcessingStatus({
  packageId,
  listingId,
  initialPackage,
  initialPieces,
}: ProcessingStatusProps) {
  const router = useRouter();
  const [pkg, setPkg] = useState<PackageStatus>(initialPackage);
  const [pieces, setPieces] = useState<PieceStatus[]>(initialPieces);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  const isTerminal =
    pkg.status === "complete" ||
    pkg.status === "failed" ||
    pkg.status === "partial_failure";

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/packages/${packageId}/status`);
      if (!res.ok) return;
      const data = await res.json();
      setPkg(data.package);
      setPieces(data.pieces);

      if (
        data.package.status === "complete" ||
        data.package.status === "partial_failure"
      ) {
        router.push(`/listings/${listingId}/content`);
      }
    } catch {
      // Silently retry on next interval
    }
  }, [packageId, listingId, router]);

  // Poll for status updates
  useEffect(() => {
    if (isTerminal) return;
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [poll, isTerminal]);

  // Elapsed timer
  useEffect(() => {
    if (isTerminal) return;
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isTerminal]);

  // Cycle through stage messages
  useEffect(() => {
    if (isTerminal) return;
    const timer = setInterval(
      () => setStageIndex((i) => (i + 1) % STAGE_MESSAGES.length),
      8000
    );
    return () => clearInterval(timer);
  }, [isTerminal]);

  const handleRetry = async (pieceId: string) => {
    setRetrying(pieceId);
    try {
      const res = await fetch(`/api/pieces/${pieceId}/retry`, { method: "POST" });
      if (res.ok) {
        setPieces((prev) =>
          prev.map((p) =>
            p.id === pieceId ? { ...p, status: "processing", error_message: null } : p
          )
        );
      }
    } catch {
      // ignore
    } finally {
      setRetrying(null);
    }
  };

  const completedCount = pieces.filter((p) => p.status === "complete").length;
  const failedCount = pieces.filter((p) => p.status === "failed").length;
  const processingCount = pieces.filter((p) => p.status === "processing").length;
  const pendingCount = pieces.filter((p) => p.status === "pending").length;
  const progressPct = Math.round((completedCount / pkg.total_pieces) * 100);

  // Estimate remaining time
  const remainingPieces = pkg.total_pieces - completedCount - failedCount;
  const estimatedSecondsLeft = remainingPieces * AVG_SECONDS_PER_PIECE;
  const estimatedMinutes = Math.max(1, Math.ceil(estimatedSecondsLeft / 60));

  const formatElapsed = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Active working indicator */}
      {!isTerminal && (
        <div className="flex items-center gap-3 rounded-lg bg-sage/10 px-4 py-3">
          <div className="relative flex h-5 w-5 items-center justify-center">
            <span className="absolute h-5 w-5 animate-ping rounded-full bg-sage/40" />
            <span className="relative h-3 w-3 rounded-full bg-sage" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-black transition-all duration-500">
              {STAGE_MESSAGES[stageIndex]}
            </p>
            <p className="text-xs text-gray-500">
              Elapsed: {formatElapsed(elapsedSeconds)}
              {completedCount > 0 && remainingPieces > 0 && (
                <> &middot; ~{estimatedMinutes} min remaining</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-black">
            {completedCount} of {pkg.total_pieces} pieces complete
          </span>
          <span className="text-gray-500">{progressPct}%</span>
        </div>
        <div className="relative mt-2 h-4 w-full overflow-hidden rounded-full bg-gray-100">
          {/* Completed portion */}
          <div
            className="h-full rounded-full bg-sage transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
          {/* Animated shimmer on the progress bar when active */}
          {!isTerminal && progressPct < 100 && (
            <div
              className="absolute inset-0 h-full animate-pulse rounded-full bg-gradient-to-r from-transparent via-sage/30 to-transparent"
              style={{ width: `${Math.min(progressPct + 10, 100)}%` }}
            />
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {processingCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
                {processingCount} generating
              </span>
            )}
            {pendingCount > 0 && (
              <span>{pendingCount} queued</span>
            )}
            {failedCount > 0 && (
              <span className="text-red-500">{failedCount} failed</span>
            )}
          </div>
        </div>
      </div>

      {/* Piece grid */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className={`flex flex-col items-center rounded-lg border p-2 transition-all duration-300 ${
              piece.status === "failed"
                ? "border-red-200 bg-red-50"
                : piece.status === "complete"
                  ? "border-green-200 bg-green-50"
                  : piece.status === "processing"
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-sage/10 bg-cream"
            }`}
          >
            <span className="text-xs font-bold text-black">
              Day {piece.day_number}
            </span>
            <span className="mt-0.5 text-[10px] capitalize text-gray-500">
              {piece.content_type}
            </span>
            <PieceStatusIcon status={piece.status} />
            {piece.status === "failed" && (
              <button
                onClick={() => handleRetry(piece.id)}
                disabled={retrying === piece.id}
                className="mt-1 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
              >
                {retrying === piece.id ? "..." : "Retry"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-gray-300" /> Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" /> Processing
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" /> Complete
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Failed
        </span>
      </div>

      {/* Status message */}
      {!isTerminal && (
        <p className="text-center text-sm text-gray-500">
          Generating your content package... This usually takes 5–10 minutes.
          <br />
          <span className="text-xs text-gray-400">
            This page updates automatically every 5 seconds. You can navigate away and come back.
          </span>
        </p>
      )}

      {isTerminal && pkg.status === "failed" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-medium text-red-700">
            Generation failed. You can retry individual pieces above.
          </p>
        </div>
      )}
    </div>
  );
}

function PieceStatusIcon({ status }: { status: string }) {
  if (status === "processing") {
    return (
      <div className="mt-1 flex items-center justify-center">
        <svg className="h-3 w-3 animate-spin text-yellow-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (status === "complete") {
    return (
      <div className="mt-1">
        <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mt-1">
        <svg className="h-3 w-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }

  // Pending
  return <span className="mt-1 h-2 w-2 rounded-full bg-gray-300" />;
}
