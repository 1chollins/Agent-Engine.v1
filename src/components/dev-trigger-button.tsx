"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DevTriggerButtonProps = {
  listingId: string;
};

export function DevTriggerButton({ listingId }: DevTriggerButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTrigger() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dev/trigger-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to trigger pipeline");
      } else {
        // Refresh the page to pick up the new package
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleTrigger}
        disabled={loading}
        className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-yellow-600 disabled:opacity-50"
      >
        {loading ? "Triggering..." : "Trigger Pipeline (Dev)"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
