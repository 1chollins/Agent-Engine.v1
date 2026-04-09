import { inngest } from "../client";
import { createServiceClient } from "@/lib/supabase/server";
import { CONTENT_CALENDAR } from "@/types/content";
import type { ListingPhoto } from "@/types/listing";
import { runTextGeneration } from "@/lib/generation/text-batch";
import { runImageGeneration } from "@/lib/generation/image-batch";
import { generateSingleReel } from "@/lib/generation/video-single-reel";

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

        // Fetch photos for assignment
        const { data: photos } = await supabase
          .from("listing_photos")
          .select("*")
          .eq("listing_id", listing_id)
          .order("sort_order");

        const typedPhotos = (photos ?? []) as ListingPhoto[];
        const photoAssignments = assignPhotos(typedPhotos);

        // Create 14 content pieces
        const pieces = CONTENT_CALENDAR.map((entry, index) => ({
          package_id: pkg.id,
          day_number: entry.day,
          content_type: entry.type,
          platform: entry.platform,
          status: "pending" as const,
          recommended_time: entry.time,
          source_photo_ids: photoAssignments[index] ?? [],
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
    // Steps 3 + 4a-4e: Images and per-reel videos IN PARALLEL
    // Key: call step.run WITHOUT await to get promises, then Promise.all
    // -------------------------------------------------------
    const imageStep = step.run("generate-images", async () => {
      const result = await runImageGeneration(listing_id, packageId);
      return { succeeded: result.succeeded, failed: result.failed };
    });

    const reelSteps = REEL_DAYS.map((day, i) =>
      step.run(`generate-video-reel-${i + 1}`, async () => {
        return await generateSingleReel(listing_id, packageId, day);
      })
    );

    await Promise.all([imageStep, ...reelSteps]);

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

/**
 * Distributes photos across 14 content pieces.
 * Duplicated from pipeline.ts to avoid importing the local-dev-only module.
 */
function assignPhotos(photos: ListingPhoto[]): string[][] {
  if (photos.length === 0) return Array(14).fill([]);

  const hero = photos.find((p) => p.is_hero) ?? photos[0];
  const others = photos.filter((p) => p.id !== hero.id);
  const assignments: string[][] = [];

  for (let i = 0; i < 14; i++) {
    const entry = CONTENT_CALENDAR[i];

    if (entry.type === "post") {
      if (i === 0) {
        assignments.push([hero.id]);
      } else {
        const postIndex = Math.floor(i / 3);
        const photo = others[postIndex % others.length];
        assignments.push([photo?.id ?? hero.id]);
      }
    } else if (entry.type === "reel") {
      // For Inngest: 1 photo per reel (single clip to stay within 60s timeout)
      if (i === 1) {
        assignments.push([hero.id]);
      } else {
        const reelIndex = Math.floor(i / 3);
        const photo = others[reelIndex % others.length];
        assignments.push([photo?.id ?? hero.id]);
      }
    } else {
      const storyIndex = Math.floor(i / 3) + 2;
      const photo = others[storyIndex % others.length];
      assignments.push([photo?.id ?? hero.id]);
    }
  }

  return assignments;
}
