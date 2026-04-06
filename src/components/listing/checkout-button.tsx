"use client";

import { useState } from "react";

type CheckoutButtonProps = {
  listingId: string;
  disabled?: boolean;
};

export function CheckoutButton({ listingId, disabled }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
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

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={disabled || loading}
        className="rounded-lg bg-sage px-8 py-3 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Redirecting to payment..." : "Confirm & Pay"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
