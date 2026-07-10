/**
 * Remotion Lambda render client — replaces creatomate-render.ts.
 *
 * Same orchestration shape (start → poll → finalize → markFailed) so
 * generate-package.ts and retry-piece.ts only swap imports and thread
 * the extra `bucketName` through polling.
 *
 * Env (local .env.local AND Vercel — regular vars, locally verifiable):
 * - REMOTION_AWS_ACCESS_KEY_ID / REMOTION_AWS_SECRET_ACCESS_KEY
 * - REMOTION_LAMBDA_FUNCTION_NAME  (from `npx remotion lambda functions deploy`)
 * - REMOTION_SERVE_URL             (from `npx remotion lambda sites create`)
 * - REMOTION_AWS_REGION            (optional, default us-east-1)
 *
 * Generative motion (Kling) is intentionally NOT supported here —
 * permanent architectural decision; Ken Burns on real photos only.
 */
import {
  renderMediaOnLambda,
  getRenderProgress,
  type AwsRegion,
} from "@remotion/lambda/client";
import { createServiceClient } from "@/lib/supabase/server";
import { getPhotoSignedUrls } from "./video-clips";
import {
  COMPOSITION_DEFS,
  buildCompositionInputProps,
  isCompositionTemplateKey,
  seedFromPieceId,
} from "./composition-map";
import type { ContentPiece } from "@/types/content";

const DEFAULT_REGION: AwsRegion = "us-east-1";

function getRegion(): AwsRegion {
  return (process.env.REMOTION_AWS_REGION as AwsRegion) ?? DEFAULT_REGION;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. See remotion-render.ts header for setup.`);
  }
  return value;
}

export type StartRenderResult = {
  renderId: string;
  bucketName: string;
  pieceId: string;
  userId: string;
  templateKey: string;
};

async function startRender(
  contentType: "reel" | "story",
  listingId: string,
  packageId: string,
  dayNumber: number
): Promise<StartRenderResult> {
  const supabase = createServiceClient();

  const { data: piece } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("package_id", packageId)
    .eq("day_number", dayNumber)
    .eq("content_type", contentType)
    .single();

  if (!piece) {
    throw new Error(`No ${contentType} piece found for day ${dayNumber}`);
  }

  const typedPiece = piece as ContentPiece;

  if (typedPiece.status === "complete") {
    throw new Error(
      `Piece ${typedPiece.id} (day ${dayNumber}) is already complete — skipping duplicate render`
    );
  }
  if (typedPiece.status === "processing") {
    throw new Error(
      `Piece ${typedPiece.id} (day ${dayNumber}) is already processing — skipping duplicate render`
    );
  }

  const templateKey = typedPiece.template_key;
  if (!templateKey) {
    await markPieceFailed(
      typedPiece.id,
      `No template_key set on ${contentType} piece for day ${dayNumber}`
    );
    throw new Error(`No template_key set on ${contentType} piece for day ${dayNumber}`);
  }
  if (!isCompositionTemplateKey(templateKey)) {
    await markPieceFailed(typedPiece.id, `Unknown template_key: ${templateKey}`);
    throw new Error(`Unknown template_key: ${templateKey}`);
  }

  try {
    const { data: listing } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (!listing) {
      throw new Error("Listing not found");
    }

    const ls = listing as Record<string, unknown>;
    const userId = ls.user_id as string;

    const { data: brand } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    await supabase
      .from("content_pieces")
      .update({ status: "processing" })
      .eq("id", typedPiece.id);

    const photoIds = typedPiece.source_photo_ids ?? [];
    if (photoIds.length === 0) {
      throw new Error(`No photos assigned to this ${contentType}`);
    }

    const photoUrls = await getPhotoSignedUrls(listingId, photoIds);
    if (photoUrls.length === 0) {
      throw new Error("Could not get signed URLs for photos");
    }

    const inputProps = await buildCompositionInputProps({
      templateKey,
      photoUrls,
      listing: ls,
      brand: brand as Record<string, unknown> | null,
      seed: seedFromPieceId(typedPiece.id),
      supabase,
    });

    const { renderId, bucketName } = await renderMediaOnLambda({
      region: getRegion(),
      functionName: requireEnv("REMOTION_LAMBDA_FUNCTION_NAME"),
      serveUrl: requireEnv("REMOTION_SERVE_URL"),
      composition: COMPOSITION_DEFS[templateKey].compositionId,
      inputProps,
      codec: "h264",
      privacy: "public",
      // Chunk size tuned via env. Higher = fewer parallel lambdas.
      // Keep at 100 while the account Lambda concurrency quota is low
      // (new-account default ~10); lower once the 1000 quota is granted
      // for faster renders.
      framesPerLambda: Number(process.env.REMOTION_FRAMES_PER_LAMBDA ?? 100),
    });

    return {
      renderId,
      bucketName,
      pieceId: typedPiece.id,
      userId,
      templateKey,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await markPieceFailed(typedPiece.id, message);
    throw err;
  }
}

export async function startReelRender(
  listingId: string,
  packageId: string,
  dayNumber: number
): Promise<StartRenderResult> {
  return startRender("reel", listingId, packageId, dayNumber);
}

export async function startStoryRender(
  listingId: string,
  packageId: string,
  dayNumber: number
): Promise<StartRenderResult> {
  return startRender("story", listingId, packageId, dayNumber);
}

export type PollResult = {
  status: "rendering" | "succeeded" | "failed";
  url?: string;
  errorMessage?: string;
  /** Actual accrued Lambda cost estimate for this render (USD). */
  costUsd?: number;
};

export async function checkRenderStatus(
  renderId: string,
  bucketName: string
): Promise<PollResult> {
  const progress = await getRenderProgress({
    renderId,
    bucketName,
    functionName: requireEnv("REMOTION_LAMBDA_FUNCTION_NAME"),
    region: getRegion(),
  });

  if (progress.fatalErrorEncountered) {
    return {
      status: "failed",
      errorMessage:
        progress.errors?.[0]?.message ?? "Unknown Lambda render error",
    };
  }

  if (progress.done) {
    return {
      status: "succeeded",
      url: progress.outputFile ?? undefined,
      costUsd: progress.costs?.accruedSoFar,
    };
  }

  return { status: "rendering" };
}

type FinalizeParams = {
  renderUrl: string;
  pieceId: string;
  listingId: string;
  userId: string;
  dayNumber: number;
  templateKey: string;
  costUsd?: number;
};

async function finalizeRender(
  kind: "reels" | "stories",
  params: FinalizeParams
): Promise<{ succeeded: true }> {
  const { renderUrl, pieceId, listingId, userId, dayNumber, templateKey, costUsd } =
    params;
  const supabase = createServiceClient();

  const response = await fetch(renderUrl);
  if (!response.ok) {
    throw new Error(`Failed to download from Lambda output: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());

  const assetPath = `${userId}/${listingId}/${kind}/day-${dayNumber}.mp4`;
  const { error: uploadError } = await supabase.storage
    .from("generated-content")
    .upload(assetPath, buffer, { contentType: "video/mp4", upsert: true });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  try {
    await supabase.from("cost_logs").insert({
      listing_id: listingId,
      content_piece_id: pieceId,
      service: "remotion_lambda",
      endpoint: `remotion:render_${kind === "reels" ? "reel" : "story"}:${templateKey}`,
      cost_usd: costUsd ?? 0.02,
      response_time_ms: null,
      success: true,
    });
  } catch (logErr) {
    console.error("Failed to log Remotion Lambda cost:", logErr);
  }

  await supabase
    .from("content_pieces")
    .update({
      asset_path: assetPath,
      asset_type: "video",
      status: "complete",
      generated_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", pieceId);

  return { succeeded: true };
}

export async function finalizeReelRender(
  params: FinalizeParams
): Promise<{ succeeded: true }> {
  return finalizeRender("reels", params);
}

export async function finalizeStoryRender(
  params: FinalizeParams
): Promise<{ succeeded: true }> {
  return finalizeRender("stories", params);
}

/**
 * Polls render status with regular sleep() for use outside Inngest
 * (retry-piece.ts). Returns { url, costUsd } on success.
 *
 * Budget: 48 polls x 5s = 240s. Must be long enough to outlast slow
 * renders on the 300s Lambda function, but short enough that the whole
 * retry invocation (start + poll + finalize) stays inside the Vercel
 * route's maxDuration of 300s.
 */
export async function pollRenderToCompletion(
  renderId: string,
  bucketName: string,
  maxAttempts: number = 48,
  intervalMs: number = 5000
): Promise<{ url: string; costUsd?: number }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    const result = await checkRenderStatus(renderId, bucketName);

    if (result.status === "succeeded") {
      if (!result.url) throw new Error("Render succeeded but no URL returned");
      return { url: result.url, costUsd: result.costUsd };
    }

    if (result.status === "failed") {
      throw new Error(`Lambda render failed: ${result.errorMessage}`);
    }
  }

  throw new Error(`Lambda render timed out after ${maxAttempts} polls`);
}

export async function markPieceFailed(
  pieceId: string,
  errorMessage: string
): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("content_pieces")
    .update({
      status: "failed",
      error_message: `Video generation failed: ${errorMessage}`,
    })
    .eq("id", pieceId);
}
