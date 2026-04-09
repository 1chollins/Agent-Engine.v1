import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generatePackage } from "@/inngest/functions/generate-package";
import { retryPieceFunction } from "@/inngest/functions/retry-piece";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generatePackage, retryPieceFunction],
});
