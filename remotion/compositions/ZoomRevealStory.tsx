/**
 * ZoomRevealStory — variety alternate for story days.
 *
 * Shares the exact props schema as TripleSlideStory, so the template
 * selector can swap between them with zero data-plumbing changes.
 * Distinct look: zoom-OUT reveals (105%→100%) instead of zoom-in,
 * uppercase letter-spaced text pinned top, slower fade-only cuts.
 * 13s / 390 frames @ 30fps (3×140 − 2×15), matching TripleSlideStory.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { TextOverlay } from "../components/TextOverlay";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { textEnterFrameFor } from "../lib/seeded";
import {
  tripleSlideStorySchema,
  TRIPLE_SLIDE_DURATION_FRAMES,
  TRIPLE_SLIDE_FPS,
} from "./TripleSlideStory";
import type { TripleSlideStoryProps } from "./TripleSlideStory";

export const ZOOM_REVEAL_FPS = TRIPLE_SLIDE_FPS;
export const ZOOM_REVEAL_DURATION_FRAMES = TRIPLE_SLIDE_DURATION_FRAMES;
const SLIDE_FRAMES = 140;
const TRANSITION_FRAMES = 15;

export const zoomRevealStorySchema = tripleSlideStorySchema;

export const ZoomRevealStory: React.FC<TripleSlideStoryProps> = ({
  photoUrls,
  city,
  state,
  seed,
}) => {
  const textEnterFrame = textEnterFrameFor(seed, "reveal-city", 15, 40);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <BackgroundMusic seed={seed} />
      <TransitionSeries>
        {photoUrls.map((url, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={SLIDE_FRAMES}>
              <KenBurnsImage
                src={url}
                durationInFrames={SLIDE_FRAMES}
                seed={seed}
                slideIndex={i}
                mode="out"
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

      {/* Top-pinned, uppercase, letter-spaced treatment */}
      <TextOverlay
        text={`${city} · ${state}`}
        enterFrame={textEnterFrame}
        position="top"
        fontSize={52}
        uppercase
      />
    </AbsoluteFill>
  );
};
