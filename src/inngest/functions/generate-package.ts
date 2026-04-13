import { inngest } from "../client";
import { createServiceClient } from "@/lib/supabase/server";
import { CONTENT_CALENDAR } from "@/types/content";
import type { ListingPhoto } from "@/types/listing";
import { runTextGeneration } from "@/lib/generation/text-batch";
import { runImageGeneration } from "@/lib/generation/image-batch";
import {
  startReelRender,
  checkReelRenderStatus,
  finalizeReelRender,
  markPieceFailed,
} from "@/lib/generation/video-single-reel";
import { pickPhotosForPackage } from "@/lib/generation/photo-picker";
import { selectTemplate, getPhotoCountForTemplate } from "@/lib/generation/template-selector";

const REEL_DAYS = [2, 5, 8, 11, 14];

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
            const key = selectTemplate({ contentType: entry.type, dayNumber: entry.day });
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
    // Step 3: Images + Step 4a-4e: Start reel renders (PARALLEL)
    // -------------------------------------------------------
    const imageStep = step.run("generate-images", async () => {
      const result = await runImageGeneration(listing_id, packageId);
      return { succeeded: result.succeeded, failed: result.failed };
    });

    const startSteps = REEL_DAYS.map((day, i) =>
      step.run(`start-reel-${i + 1}`, async () => {
        return await startReelRender(listing_id, packageId, day);
      })
    );

    const reelStartResults = await Promise.allSettled(startSteps);
    await Promise.allSettled([imageStep]);

    // -------------------------------------------------------
    // Steps 5a-5e: Poll + finalize each reel (PARALLEL)
    // Each reel polls independently with step.sleep between attempts.
    // -------------------------------------------------------
    const MAX_POLL_ATTEMPTS = 10;

    type StartReelResult = {
      renderId: string;
      pieceId: string;
      userId: string;
      templateKey: string;
    };

    async function pollAndFinalizeReel(
      day: number,
      i: number,
      startResult: PromiseSettledResult<StartReelResult>
    ): Promise<void> {
      if (startResult.status === "rejected") {
        return; // piece already marked failed in startReelRender's catch
      }

      const { renderId, pieceId, userId, templateKey } = startResult.value;

      let renderUrl: string | null = null;
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        await step.sleep(`wait-reel-${i + 1}-${attempt}`, "5s");

        const pollResult = await step.run(
          `poll-reel-${i + 1}-${attempt}`,
          async () => checkReelRenderStatus(renderId)
        );

        if (pollResult.status === "succeeded") {
          renderUrl = pollResult.url ?? null;
          break;
        }

        if (pollResult.status === "failed") {
          await step.run(`fail-reel-${i + 1}`, async () =>
            markPieceFailed(
              pieceId,
              `Creatomate render failed: ${pollResult.errorMessage}`
            )
          );
          return;
        }
      }

      // If the loop exits naturally without break (status still "rendering"
      // on the final attempt), renderUrl stays null and we fall through to
      // the timeout branch.
      if (renderUrl) {
        await step.run(`finalize-reel-${i + 1}`, async () =>
          finalizeReelRender({
            renderUrl,
            pieceId,
            listingId: listing_id,
            userId,
            dayNumber: day,
            templateKey,
          })
        );
      } else {
        await step.run(`timeout-reel-${i + 1}`, async () =>
          markPieceFailed(
            pieceId,
            "Creatomate render timed out after 10 polls (50s)"
          )
        );
      }
    }

    // Fire all 5 reel poll-and-finalize blocks concurrently
    await Promise.allSettled(
      REEL_DAYS.map((day, i) =>
        pollAndFinalizeReel(day, i, reelStartResults[i])
      )
    );

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

