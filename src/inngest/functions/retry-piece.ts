import { inngest } from "../client";
import { retryPiece } from "@/lib/generation/retry-piece";

export const retryPieceFunction = inngest.createFunction(
  {
    id: "retry-content-piece",
    retries: 2,
    triggers: [{ event: "piece/retry.requested" }],
  },
  async ({ event, step }) => {
    const { piece_id } = event.data as { piece_id: string };

    await step.run("retry-piece", async () => {
      await retryPiece(piece_id);
    });
  }
);
