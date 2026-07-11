import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generatePackage } from "@/inngest/functions/generate-package";
import { retryPieceFunction } from "@/inngest/functions/retry-piece";
import { animateQuickPost } from "@/inngest/functions/animate-quick-post";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generatePackage, retryPieceFunction, animateQuickPost],
});
