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

      // Auto-redirect when complete
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

  useEffect(() => {
    if (isTerminal) return;
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [poll, isTerminal]);

  const handleRetry = async (pieceId: string) => {
    setRetrying(pieceId);
    try {
      const res = await fetch(`/api/pieces/${pieceId}/retry`, {
        method: "POST",
      });
      if (res.ok) {
        // Update local state to show processing
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
  const processingCount = pieces.filter(
    (p) => p.status === "processing"
  ).length;
  const progressPct = Math.round((completedCount / pkg.total_pieces) * 100);

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-black">
            {completedCount} of {pkg.total_pieces} pieces complete
          </span>
          <span className="text-gray-500">{progressPct}%</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-sage transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {processingCount > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {processingCount} piece{processingCount > 1 ? "s" : ""} currently
            generating...
          </p>
        )}
        {failedCount > 0 && (
          <p className="mt-1 text-xs text-red-600">
            {failedCount} piece{failedCount > 1 ? "s" : ""} failed
          </p>
        )}
      </div>

      {/* Piece grid */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className={`flex flex-col items-center rounded-lg border p-2 ${
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
            <PieceStatusDot status={piece.status} />
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
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-gray-300" /> Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" /> Processing
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
          Estimated processing time: 5–10 minutes. This page updates
          automatically every 5 seconds.
        </p>
      )}
    </div>
  );
}

function PieceStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-gray-300",
    processing: "bg-yellow-400 animate-pulse",
    complete: "bg-green-500",
    failed: "bg-red-500",
  };

  return (
    <span
      className={`mt-1 h-2 w-2 rounded-full ${colors[status] ?? colors.pending}`}
    />
  );
}
