"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Invisible helper: re-fetches the current server component tree on an
 * interval. Used on pages that render a "waiting" state before the row
 * they display exists yet (e.g. processing page before the content
 * package has been created by the background job).
 */
export function AutoRefresh({ intervalMs = 4000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(timer);
  }, [router, intervalMs]);

  return null;
}
