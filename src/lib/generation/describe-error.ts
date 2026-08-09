/**
 * Turn anything thrown into a string that is actually useful in
 * content_pieces.error_message.
 *
 * Why this exists: the pattern used everywhere in the generation pipeline is
 *
 *     const message = err instanceof Error ? err.message : "Unknown error";
 *
 * which looks safe and isn't. An Error whose `message` is an empty string — and
 * AWS SDK, Remotion Lambda and fetch failures produce those — passes the
 * `instanceof` check and yields "". The caller then writes
 * `Video generation failed: ` and the actual cause is gone.
 *
 * That is not a hypothetical. As of the 2026-08-07 audit it is the single
 * largest failure class in the product: 20 of 42 failed pieces (12 reels, 8
 * stories) carry the literal string "Video generation failed: " with nothing
 * after the colon. Twenty customer-facing failures with no recorded reason,
 * which is why nobody could fix them.
 *
 * This walks progressively weaker sources of detail and is guaranteed never to
 * return an empty or whitespace-only string.
 */
export function describeError(err: unknown): string {
  const parts: string[] = [];

  if (err instanceof Error) {
    const message = err.message?.trim();
    if (message) parts.push(message);

    // An empty message often still has a useful constructor name
    // (TypeError, AbortError, TimeoutError, AccessDenied...).
    if (!message && err.name) parts.push(`${err.name} (no message)`);

    // AWS SDK and several HTTP clients hang the real detail off `cause`.
    const cause = (err as Error & { cause?: unknown }).cause;
    if (cause !== undefined && cause !== null) {
      const causeText = shallowDescribe(cause);
      if (causeText && !parts.includes(causeText)) parts.push(`cause: ${causeText}`);
    }

    // Remotion/AWS attach status codes and error codes as extra properties.
    const extra = err as Error & { code?: unknown; status?: unknown; statusCode?: unknown };
    const code = extra.code ?? extra.status ?? extra.statusCode;
    if (code !== undefined && code !== null && String(code).trim()) {
      parts.push(`code: ${String(code).trim()}`);
    }

    if (parts.length > 0) return truncate(parts.join(" — "));
    return truncate(`${err.name || "Error"} with no message or detail`);
  }

  const described = shallowDescribe(err);
  return truncate(described || "Unknown error (nothing was thrown with it)");
}

/** Best-effort one-line rendering of a non-Error value. */
function shallowDescribe(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Error) return value.message?.trim() || value.name || "Error";
  try {
    const json = JSON.stringify(value);
    // "{}" tells the reader nothing; say so explicitly instead.
    if (!json || json === "{}") return `non-serialisable ${typeof value}`;
    return json;
  } catch {
    return `un-stringifiable ${typeof value}`;
  }
}

/** error_message is displayed in the UI; keep it readable. */
function truncate(text: string, max = 900): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}
