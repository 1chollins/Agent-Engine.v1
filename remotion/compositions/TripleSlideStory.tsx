/**
 * TripleSlideStory — Remotion replacement for the Creatomate
 * "story_triple_slide" template (cb090682).
 *
 * Spec parity: 3 photos, city/state text overlay, 13s @ 9:16.
 * Timing: 390 frames @ 30fps. Three 140-frame slides with two 15-frame
 * crossfades (3×140 − 2×15 = 390).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { z } from "zod";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { TextOverlay } from "../components/TextOverlay";
import { textEnterFrameFor } from "../lib/seeded";

export const TRIPLE_SLIDE_FPS = 30;
export const TRIPLE_SLIDE_DURATION_FRAMES = 390; // 13s
const SLIDE_FRAMES = 140;
const TRANSITION_FRAMES = 15;

export const tripleSlideStorySchema = z.object({
  photoUrls: z.array(z.string()).length(3),
  city: z.string(),
  state: z.string(),
  seed: z.number(),
});

export type TripleSlideStoryProps = z.infer<typeof tripleSlideStorySchema>;

export const TripleSlideStory: React.FC<TripleSlideStoryProps> = ({
  photoUrls,
  city,
  state,
  seed,
}) => {
  const textEnterFrame = textEnterFrameFor(seed, "city-state", 12, 45);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries>
        {photoUrls.map((url, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={SLIDE_FRAMES}>
              <KenBurnsImage
                src={url}
                durationInFrames={SLIDE_FRAMES}
                seed={seed}
                slideIndex={i}
              />
            </TransitionSeries.Sequence>
            {i < photoUrls.length - 1 ? (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />
            ) : null}
          </React.Fragment>
        ))}
      </TransitionSeries>

      <TextOverlay
        text={`${city}, ${state}`}
        enterFrame={textEnterFrame}
        position="bottom"
      />
    </AbsoluteFill>
  );
};
