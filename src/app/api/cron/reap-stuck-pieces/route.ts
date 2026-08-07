import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/server";

/**
 * Reaper for content pieces that got stuck mid-render.
 *
 * Nothing else in the pipeline has an opinion about time. A piece is set to
 * `processing` when a render starts, and the only things that move it off that
 * status are the success and failure paths of that same render. If the worker
 * dies — Lambda timeout, deploy mid-flight, an unhandled throw before the
 * failure write — the row stays `processing` for ever.
 *
 * That is not hypothetical: the 2026-08-07 audit found six pieces that had been
 * `processing` since 2026-07-09, 28 days. Their package sat at `processing` too,
 * so from the customer's side those pieces simply never arrived and nothing
 * ever explained why.
 *
 * This sweep marks anything stuck past the cutoff as `failed` with a clear
 * reason, then recomputes its package's counts so a half-finished package stops
 * claiming to be in progress. A failed piece is honest and retryable; a piece
 * frozen in `processing` is neither.
 *
 * Schedule: hourly (see vercel.json). Guarded by CRON_SECRET, fail-closed.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * How long a render may legitimately stay `processing`.
 *
 * The Remotion Lambda is configured with a 300-second timeout and reels poll to
 * completion, so a healthy piece finishes well inside an hour. Two hours leaves
 * generous headroom for a slow queue while still catching a dead worker the
 * same day rather than four weeks later.
 */
const STUCK_AFTER_MS = 2 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/reap-stuck-pieces] CRON_SECRET is not set");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const cutoff = new Date(Date.now() - STUCK_AFTER_MS).toISOString();

    // created_at is the only timestamp every piece carries, so it is what the
    // cutoff is measured against. A piece created long ago and legitimately
    // rendering right now would be a false positive, but that cannot happen:
    // a render is started within the same job that creates the piece.
    const { data: stuck, error } = await supabase
      .from("content_pieces")
      .select("id, package_id, day_number, content_type, created_at")
      .eq("status", "processing")
      .lt("created_at", cutoff);

    if (error) {
      throw new Error(`scan failed: ${error.message}`);
    }

    if (!stuck || stuck.length === 0) {
      return NextResponse.json({ ok: true, reaped: 0, packages: 0 });
    }

    const ids = stuck.map((p) => p.id);
    const { error: updateError } = await supabase
      .from("content_pieces")
      .update({
        status: "failed",
        error_message:
          "Render did not report back within 2 hours and was marked failed by the stuck-piece sweep. The worker most likely died mid-render. This piece can be retried.",
      })
      .in("id", ids);

    if (updateError) {
      throw new Error(`update failed: ${updateError.message}`);
    }

    // Recompute each affected package so it stops advertising "processing".
    const packageIds = [...new Set(stuck.map((p) => p.package_id))];
    for (const packageId of packageIds) {
      await recountPackage(packageId, supabase);
    }

    console.warn(
      `[cron/reap-stuck-pieces] reaped ${stuck.length} piece(s) across ${packageIds.length} package(s):`,
      stuck.map((p) => `${p.content_type} day ${p.day_number} (${p.id})`).join(", "),
    );

    return NextResponse.json({
      ok: true,
      reaped: stuck.length,
      packages: packageIds.length,
      pieces: stuck.map((p) => ({
        id: p.id,
        contentType: p.content_type,
        dayNumber: p.day_number,
        stuckSince: p.created_at,
      })),
    });
  } catch (err) {
    console.error("[cron/reap-stuck-pieces] error:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

/**
 * Mirrors updatePackageCounts() in lib/generation/retry-piece.ts. Duplicated
 * rather than imported because that module is private to the generation
 * pipeline and pulls in the whole render stack; this route needs only the
 * counting.
 */
async function recountPackage(
  packageId: string,
  supabase: ReturnType<typeof createServiceClient>,
): Promise<void> {
  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("status")
    .eq("package_id", packageId);

  if (!pieces || pieces.length === 0) return;

  const completed = pieces.filter((p) => p.status === "complete").length;
  const failed = pieces.filter((p) => p.status === "failed").length;
  const allComplete = pieces.every((p) => p.status === "complete");
  const allFailed = pieces.every((p) => p.status === "failed");
  const anyFailed = pieces.some((p) => p.status === "failed");

  let status: string;
  if (allComplete) status = "complete";
  else if (allFailed) status = "failed";
  else if (anyFailed) status = "partial_failure";
  else status = "processing";

  await supabase
    .from("content_packages")
    .update({
      completed_pieces: completed,
      failed_pieces: failed,
      status,
      processing_completed_at:
        status !== "processing" ? new Date().toISOString() : null,
    })
    .eq("id", packageId);
}
