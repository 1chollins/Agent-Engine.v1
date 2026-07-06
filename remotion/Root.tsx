import React from "react";
import { Composition } from "remotion";
import {
  TripleSlideStory,
  tripleSlideStorySchema,
  TRIPLE_SLIDE_DURATION_FRAMES,
  TRIPLE_SLIDE_FPS,
} from "./compositions/TripleSlideStory";

/**
 * Composition registry. IDs here become the render targets in Phase 3
 * (replacing Creatomate template UUIDs / env vars).
 *
 * Default props are placeholders for Remotion Studio preview only —
 * production props are injected per render.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TripleSlideStory"
        component={TripleSlideStory}
        schema={tripleSlideStorySchema}
        width={1080}
        height={1920}
        fps={TRIPLE_SLIDE_FPS}
        durationInFrames={TRIPLE_SLIDE_DURATION_FRAMES}
        defaultProps={{
          photoUrls: [
            "https://picsum.photos/seed/exterior/1600/1067",
            "https://picsum.photos/seed/kitchen/1600/1067",
            "https://picsum.photos/seed/pool/1067/1600",
          ],
          city: "Fort Myers",
          state: "FL",
          seed: 42,
        }}
      />
    </>
  );
};
