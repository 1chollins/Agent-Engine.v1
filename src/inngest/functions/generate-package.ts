import { inngest } from "../client";
import { createServiceClient } from "@/lib/supabase/server";
import { CONTENT_CALENDAR } from "@/types/content";
import type { ListingPhoto } from "@/types/listing";
import { runTextGeneration } from "@/lib/generation/text-batch";
import { runImageGeneration } from "@/lib/generation/image-batch";
import {
  startReelRender,
  startStoryRender,
  checkRenderStatus,
  finalizeReelRender,
  finalizeStoryRender,
  markPieceFailed,
} from "@/lib/generation/remotion-render";
import { pickPhotosForPackage } from "@/lib/generation/photo-picker";
import { selectTemplate, getPhotoCountForTemplate } from "@/lib/generation/template-selector";
import {
  submitAllClips,
  checkAndFinalizePending,
  logClipOutcomes,
  MAX_KLING_POLL_ATTEMPTS,
  KLING_POLL_INTERVAL,
} from "@/lib/generation/motion-stage";
import { MOTION_PIPELINE_ENABLED } from "@/lib/generation/motion-config";

const REEL_DAYS = [2, 5, 8, 11, 14];
const STORY_DAYS = [3, 6, 9, 12];

export const generatePackage = inngest.createFunction(
  {
    id: "generate-content-package",
    retries: 0,
    triggers: [{ event: "package/generation.requested" }],
  },
  async ({ event, step }) => {
    const { listing_id } = event.data as { listing_id: string };

    // -------------------------------------------------------
    // Step 1: Create package + 14 pieces (idempotent)
    // -------------------------------------------------------
    const packageId = await step.run(
      "create-package",
      async () => {
        const supabase = createServiceClient();

        // Idempotency: check for ANY existing package for this listing
        const { data: existing } = await supabase
          .from("content_packages")
          .select("id, status")
          .eq("listing_id", listing_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing) {
          const pkgId = existing.id as string;
          const status = existing.status as string;

          // Already complete — nothing to do
          if (status === "complete") {
            return pkgId;
          }

          // Still processing — let subsequent steps pick up where they left off
          if (status === "processing") {
            return pkgId;
          }

          // Failed or partial_failure — reset for retry
          if (status === "failed" || status === "partial_failure") {
            await supabase
              .from("content_packages")
              .update({
                status: "processing",
                completed_pieces: 0,
                failed_pieces: 0,
                processing_started_at: new Date().toISOString(),
                processing_completed_at: null,
              })
              .eq("id", pkgId);

            await supabase
              .from("content_pieces")
              .update({
                status: "pending",
                error_message: null,
                generated_at: null,
              })
              .eq("package_id", pkgId);

            return pkgId;
          }

          // Any other status (e.g. pending) — just return it
          return pkgId;
        }

        // No existing package — create new
        const { data: pkg, error: pkgError } = await supabase
          .from("content_packages")
          .insert({
            listing_id,
            status: "processing",
            total_pieces: 14,
            processing_started_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (pkgError || !pkg) {
          throw new Error(`Failed to create package: ${pkgError?.message}`);
        }

        // Fetch listing for vertical hero
        const { data: listing } = await supabase
          .from("listings")
          .select("vertical_hero_photo_id")
          .eq("id", listing_id)
          .single();

        // Fetch photos for assignment
        const { data: photos } = await supabase
          .from("listing_photos")
          .select("*")
          .eq("listing_id", listing_id)
          .order("sort_order");

        const typedPhotos = (photos ?? []) as ListingPhoto[];

        // Select templates and build per-day photo counts
        const templateSelections: Record<number, string | null> = {};
        const photoCounts: Record<number, number> = {};

        for (const entry of CONTENT_CALENDAR) {
          if (entry.type === "reel" || entry.type === "story") {
            const key = selectTemplate({
              contentType: entry.type,
              dayNumber: entry.day,
              listingId: listing_id,
            });
            templateSelections[entry.day] = key;
            photoCounts[entry.day] = getPhotoCountForTemplate(key);
          } else {
            templateSelections[entry.day] = null;
            photoCounts[entry.day] = 1;
          }
        }

        const photoAssignments = pickPhotosForPackage(typedPhotos, {
          photoCounts,
          verticalHeroId: listing?.vertical_hero_photo_id ?? null,
        });

        // Create 14 content pieces
        const pieces = CONTENT_CALENDAR.map((entry, index) => ({
          package_id: pkg.id,
          day_number: entry.day,
          content_type: entry.type,
          platform: entry.platform,
          status: "pending" as const,
          recommended_time: entry.time,
          source_photo_ids: photoAssignments[index] ?? [],
          template_key: templateSelections[entry.day] ?? null,
        }));

        const { error: piecesError } = await supabase
          .from("content_pieces")
          .insert(pieces);

        if (piecesError) {
          throw new Error(`Failed to create pieces: ${piecesError.message}`);
        }

        return pkg.id as string;
      }
    );

    // -------------------------------------------------------
    // Step 2: Text generation (must complete before images/videos)
    // -------------------------------------------------------
    await step.run("generate-text", async () => {
      const result = await runTextGeneration(listing_id, packageId);
      return { succeeded: result.succeeded, failed: result.failed };
    });

    // -------------------------------------------------------
    // Step 2.5 (gated): Kling motion clip submit + poll + finalize.
    // Self-contained — runs to completion before image/reel/story steps
    // begin, so it does NOT interleave with the existing parallel sync.
    // Flag-off: this block is skipped entirely and behavior is unchanged.
    // -------------------------------------------------------
    if (MOTION_PIPELINE_ENABLED) {
      const submitResults = await step.run("kling-submit-all", () =>
        submitAllClips({ packageId, listingId: listing_id })
      );
      let pending = submitResults.filter(
        (r) => r.status === "submitted" || r.status === "processing"
      );
      for (
        let attempt = 0;
        attempt < MAX_KLING_POLL_ATTEMPTS && pending.length > 0;
        attempt++
      ) {
        await step.sleep(`kling-wait-${attempt}`, KLING_POLL_INTERVAL);
        pending = await step.run(`kling-poll-${attempt}`, () =>
          checkAndFinalizePending(pending)
        );
      }
      await step.run("kling-summary", () => logClipOutcomes(listing_id));
    }

    // -------------------------------------------------------
    // Step 3: Images (runs alongside the first render wave)
    // -------------------------------------------------------
    const imageStep = step.run("generate-images", async () => {
      const result = await runImageGeneration(listing_id, packageId);
      return { succeeded: result.succeeded, failed: result.failed };
    });

    // -------------------------------------------------------
    // Steps 4-5: Start + poll renders in limited waves.
    // Each Remotion Lambda render fans out to multiple concurrent Lambda
    // invocations (~durationFrames / framesPerLambda), so starting all 9
    // videos at once can exceed the account concurrency quota and fail
    // with "Rate Exceeded". Waves keep concurrent renders bounded; tune
    // via REMOTION_MAX_CONCURRENT_RENDERS once the quota is raised.
    // -------------------------------------------------------
    // 36 polls × 5s = 180s budget per piece — renders inside a wave only
    // compete with wave siblings, but leave headroom for a low quota.
    const MAX_POLL_ATTEMPTS = 36;

    type StartRenderResult = {
      renderId: string;
      bucketName: string;
      pieceId: string;
      userId: string;
      templateKey: string;
    };

    async function pollAndFinalizeReel(
      day: number,
      i: number,
      startResult: PromiseSettledResult<StartRenderResult>
    ): Promise<void> {
      if (startResult.status === "rejected") {
        return; // piece already marked failed in startReelRender's catch
      }

      const { renderId, bucketName, pieceId, userId, templateKey } =
        startResult.value;

      let renderUrl: string | null = null;
      let renderCost: number | undefined;
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        await step.sleep(`wait-reel-${i + 1}-${attempt}`, "5s");

        let pollResult;
        try {
          pollResult = await step.run(
            `poll-reel-${i + 1}-${attempt}`,
            async () => checkRenderStatus(renderId, bucketName)
          );
        } catch (err) {
          // Never strand a piece in "processing": if status polling itself
          // fails after step retries (e.g. throttled getRenderProgress),
          // record the failure so the piece stays retryable.
          await step.run(`fail-poll-reel-${i + 1}`, async () =>
            markPieceFailed(
              pieceId,
              `Render status polling failed: ${
                err instanceof Error ? err.message : "unknown error"
              }`
            )
          );
          return;
        }

        if (pollResult.status === "succeeded") {
          renderUrl = pollResult.url ?? null;
          renderCost = pollResult.costUsd;
          break;
        }

        if (pollResult.status === "failed") {
          await step.run(`fail-reel-${i + 1}`, async () =>
            markPieceFailed(
              pieceId,
              `Lambda render failed: ${pollResult.errorMessage}`
            )
          );
          return;
        }
      }

      // If the loop exits naturally without break (status still "rendering"
      // on the final attempt), renderUrl stays null and we fall through to
      // the timeout branch.
      if (renderUrl) {
        try {
          await step.run(`finalize-reel-${i + 1}`, async () =>
            finalizeReelRender({
              renderUrl,
              pieceId,
              listingId: listing_id,
              userId,
              dayNumber: day,
              templateKey,
              costUsd: renderCost,
            })
          );
        } catch {
          await step.run(`fail-finalize-reel-${i + 1}`, async () =>
            markPieceFailed(pieceId, "Reel finalize failed after step retries")
          );
        }
      } else {
        await step.run(`timeout-reel-${i + 1}`, async () =>
          markPieceFailed(
            pieceId,
            "Lambda render timed out after 36 polls (180s)"
          )
        );
      }
    }

    async function pollAndFinalizeStory(
      day: number,
      i: number,
      startResult: PromiseSettledResult<StartRenderResult>
    ): Promise<void> {
      if (startResult.status === "rejected") {
        return; // piece already marked failed in startStoryRender's catch
      }

      const { renderId, bucketName, pieceId, userId, templateKey } =
        startResult.value;

      let renderUrl: string | null = null;
      let renderCost: number | undefined;
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        await step.sleep(`wait-story-${i + 1}-${attempt}`, "5s");

        let pollResult;
        try {
          pollResult = await step.run(
            `poll-story-${i + 1}-${attempt}`,
            async () => checkRenderStatus(renderId, bucketName)
          );
        } catch (err) {
          // Never strand a piece in "processing": if status polling itself
          // fails after step retries (e.g. throttled getRenderProgress),
          // record the failure so the piece stays retryable.
          await step.run(`fail-poll-story-${i + 1}`, async () =>
            markPieceFailed(
              pieceId,
              `Render status polling failed: ${
                err instanceof Error ? err.message : "unknown error"
              }`
            )
          );
          return;
        }

        if (pollResult.status === "succeeded") {
          renderUrl = pollResult.url ?? null;
          renderCost = pollResult.costUsd;
          break;
        }

        if (pollResult.status === "failed") {
          await step.run(`fail-story-${i + 1}`, async () =>
            markPieceFailed(
              pieceId,
              `Lambda render failed: ${pollResult.errorMessage}`
            )
          );
          return;
        }
      }

      // If the loop exits naturally without break (status still "rendering"
      // on the final attempt), renderUrl stays null and we fall through to
      // the timeout branch.
      if (renderUrl) {
        try {
          await step.run(`finalize-story-${i + 1}`, async () =>
            finalizeStoryRender({
              renderUrl,
              pieceId,
              listingId: listing_id,
              userId,
              dayNumber: day,
              templateKey,
              costUsd: renderCost,
            })
          );
        } catch {
          await step.run(`fail-finalize-story-${i + 1}`, async () =>
            markPieceFailed(pieceId, "Story finalize failed after step retries")
          );
        }
      } else {
        await step.run(`timeout-story-${i + 1}`, async () =>
          markPieceFailed(
            pieceId,
            "Lambda render timed out after 36 polls (180s)"
          )
        );
      }
    }

    // Start + poll renders in waves of REMOTION_MAX_CONCURRENT_RENDERS.
    // A wave's renders are started together, then polled to completion
    // before the next wave begins, keeping Lambda concurrency bounded.
    type RenderJob = { kind: "reel" | "story"; day: number; index: number };
    const renderJobs: RenderJob[] = [
      ...REEL_DAYS.map((day, index) => ({
        kind: "reel" as const,
        day,
        index,
      })),
      ...STORY_DAYS.map((day, index) => ({
        kind: "story" as const,
        day,
        index,
      })),
    ];

    const waveSize = Math.max(
      1,
      Number(process.env.REMOTION_MAX_CONCURRENT_RENDERS ?? 2)
    );

    for (let offset = 0; offset < renderJobs.length; offset += waveSize) {
      const wave = renderJobs.slice(offset, offset + waveSize);

      const startResults = await Promise.allSettled(
        wave.map((job) =>
          step.run(`start-${job.kind}-${job.index + 1}`, async () =>
            job.kind === "reel"
              ? startReelRender(listing_id, packageId, job.day)
              : startStoryRender(listing_id, packageId, job.day)
          )
        )
      );

      await Promise.allSettled(
        wave.map((job, k) =>
          job.kind === "reel"
                        ? pollAndFinalizeReel(job.day, job.index, startResults[k])
            : pollAndFinalizeStory(job.day, job.index, startResults[k])
        )
      );
    }

    await Promise.allSettled([imageStep]);

    // -------------------------------------------------------
    // Step 5: Finalize package status
    // -------------------------------------------------------
    await step.run("finalize-package", async () => {
      const supabase = createServiceClient();

      const { data: finalPieces } = await supabase
        .from("content_pieces")
        .select("status")
        .eq("package_id", packageId);

      const allComplete = finalPieces?.every((p) => p.status === "complete");
      const anyFailed = finalPieces?.some((p) => p.status === "failed");
      const allFailed = finalPieces?.every((p) => p.status === "failed");
      const completed = finalPieces?.filter((p) => p.status === "complete").length ?? 0;
      const failed = finalPieces?.filter((p) => p.status === "failed").length ?? 0;

      let packageStatus: string;
      let listingStatus: string;

      if (allFailed) {
        packageStatus = "failed";
        listingStatus = "failed";
      } else if (anyFailed) {
        packageStatus = "partial_failure";
        listingStatus = "partial_failure";
      } else if (allComplete) {
        packageStatus = "complete";
        listingStatus = "complete";
      } else {
        packageStatus = "partial_failure";
        listingStatus = "partial_failure";
      }

      await supabase
        .from("content_packages")
        .update({
          status: packageStatus,
          completed_pieces: completed,
          failed_pieces: failed,
          processing_completed_at: new Date().toISOString(),
        })
        .eq("id", packageId);

      await supabase
        .from("listings")
        .update({ status: listingStatus, updated_at: new Date().toISOString() })
        .eq("id", listing_id);

      return { packageStatus, completed, failed };
    });
  }
);

