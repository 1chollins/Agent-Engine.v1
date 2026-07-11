import { inngest } from "../client";
import { createServiceClient } from "@/lib/supabase/server";
import {
  startGenericRender,
  pollRenderToCompletion,
} from "@/lib/generation/remotion-render";

type RenderSpec = {
  row_id: string;
  asset_path: string;
  composition_id: string;
};

/**
 * Renders the two AnimatedQuickPost variants (square + story) on Lambda,
 * uploads the MP4s to storage, and flips the quick_posts rows to
 * complete. Sequential on purpose — two 6s renders finish fast and stay
 * clear of the campaign pipeline's Lambda concurrency.
 */
export const animateQuickPost = inngest.createFunction(
  {
    id: "animate-quick-post",
    retries: 1,
    triggers: [{ event: "quickpost/animate.requested" }],
  },
  async ({ event, step }) => {
    const { renders, input_props } = event.data as {
      renders: RenderSpec[];
      input_props: Record<string, unknown>;
    };

    for (const spec of renders) {
      await step.run(`render-${spec.composition_id}`, async () => {
        const supabase = createServiceClient();
        try {
          const { renderId, bucketName } = await startGenericRender(
            spec.composition_id,
            input_props
          );
          const { url, costUsd } = await pollRenderToCompletion(
            renderId,
            bucketName,
            48,
            5000
          );

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Download failed: ${response.status}`);
          }
          const buffer = Buffer.from(await response.arrayBuffer());

          const { error: uploadError } = await supabase.storage
            .from("generated-content")
            .upload(spec.asset_path, buffer, {
              contentType: "video/mp4",
              upsert: true,
            });
          if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          await supabase.from("cost_logs").insert({
            listing_id: null,
            service: "remotion_lambda",
            endpoint: `remotion:render_quick_post:${spec.composition_id}`,
            cost_usd: costUsd ?? 0.02,
            response_time_ms: null,
            success: true,
          });

          await supabase
            .from("quick_posts")
            .update({ status: "complete" })
            .eq("id", spec.row_id);

          return { ok: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          await supabase
            .from("quick_posts")
            .update({ status: "failed" })
            .eq("id", spec.row_id);
          throw new Error(`Animated quick post render failed: ${message}`);
        }
      });
    }
  }
);
