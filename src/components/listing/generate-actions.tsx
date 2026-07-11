"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type GenerateActionsProps = {
  listingId: string;
  disabled?: boolean;
};

/**
 * The two rungs of the ladder at generation time:
 *  - Free: full campaign with the Frame & Form watermark
 *  - Paid ($20 / promo code): clean, watermark-free campaign
 */
export function GenerateActions({ listingId, disabled }: GenerateActionsProps) {
  const [loading, setLoading] = useState<"free" | "paid" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleFree() {
    setLoading("free");
    setError(null);
    try {
      const res = await fetch("/api/generate-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start generation");
        return;
      }
      router.push(`/listings/${listingId}/processing`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handlePaid() {
    setLoading("paid");
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create checkout session");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="w-full sm:w-auto">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleFree}
          disabled={disabled || loading !== null}
          className="rounded-lg border border-forest px-6 py-3 text-sm font-semibold text-forest transition-colors hover:bg-forest/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "free" ? "Starting..." : "Generate Free (watermarked)"}
        </button>
        <button
          type="button"
          onClick={handlePaid}
          disabled={disabled || loading !== null}
          className="rounded-lg bg-forest px-6 py-3 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "paid" ? "Redirecting to payment..." : "Generate Watermark-Free — $20"}
        </button>
      </div>
      <p className="mt-2 text-xs text-ink/50 sm:text-right">
        Booked a shoot with Frame &amp; Form? Use your promo code at checkout —
        watermark removal is included.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
