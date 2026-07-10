/**
 * SplitRevealStory — variant of TripleSlideStory (shares its schema, so
 * the selector can swap them with zero data plumbing).
 *
 * Look: each photo holds with a Ken Burns move, then splits into top and
 * bottom halves that slide apart to reveal the next photo underneath.
 * A more graphic, editorial cut than the crossfade stories.
 * 13s @ 9:16, 390 frames @ 30fps. Three 130-frame slides; the split
 * happens over the last 20 frames of slides 1 and 2.
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  Easing,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { TextOverlay } from "../components/TextOverlay";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { textEnterFrameFor } from "../lib/seeded";

export const SPLIT_REVEAL_FPS = 30;
export const SPLIT_REVEAL_DURATION_FRAMES = 390; // 13s
const SLIDE_FRAMES = 130;
const REVEAL_FRAMES = 20;
const FRAME_H = 1920;

export const splitRevealStorySchema = z.object({
  photoUrls: z.array(z.string()).length(3),
  city: z.string(),
  state: z.string(),
  seed: z.number(),
});

export type SplitRevealStoryProps = z.infer<typeof splitRevealStorySchema>;

/**
 * One photo layer. Holds as a Ken Burns slide, then (unless it's the
 * last photo) splits into two halves that slide off vertically.
 */
const SplitSlide: React.FC<{
  url: string;
  index: number;
  seed: number;
  isLast: boolean;
  durationInFrames: number;
}> = ({ url, index, seed, isLast, durationInFrames }) => {
  const frame = useCurrentFrame(); // local to this Sequence
  const splitStart = durationInFrames - REVEAL_FRAMES;

  if (isLast || frame < splitStart) {
    return (
      <KenBurnsImage
        src={url}
        durationInFrames={durationInFrames}
        seed={seed}
        slideIndex={index}
      />
    );
  }

  // Split phase: two overflow-hidden halves, each holding the full frame.
  const p = interpolate(frame, [splitStart, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const offset = p * (FRAME_H / 2 + 40);

  const half: React.CSSProperties = {
    position: "absolute",
    left: 0,
    width: "100%",
    height: "50%",
    overflow: "hidden",
  };
  const img: React.CSSProperties = {
    position: "absolute",
    left: 0,
    width: "100%",
    height: FRAME_H,
    objectFit: "cover",
  };

  return (
    <AbsoluteFill>
      <div style={{ ...half, top: 0, transform: `translateY(${-offset}px)` }}>
        <Img src={url} style={{ ...img, top: 0 }} />
      </div>
      <div style={{ ...half, bottom: 0, transform: `translateY(${offset}px)` }}>
        <Img src={url} style={{ ...img, bottom: 0 }} />
      </div>
    </AbsoluteFill>
  );
};

export const SplitRevealStory: React.FC<SplitRevealStoryProps> = ({
  photoUrls,
  city,
  state,
  seed,
}) => {
  const textEnterFrame = textEnterFrameFor(seed, "city-state", 12, 45);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <BackgroundMusic seed={seed} />

      {/* Photos stacked: later photos mount REVEAL_FRAMES early underneath
          the current one (lower zIndex), so the split uncovers them. */}
      {photoUrls.map((url, i) => {
        const isLast = i === photoUrls.length - 1;
        const from = Math.max(0, i * SLIDE_FRAMES - REVEAL_FRAMES);
        const end = isLast
          ? SPLIT_REVEAL_DURATION_FRAMES
          : (i + 1) * SLIDE_FRAMES;
        const duration = end - from;
        return (
          <Sequence key={i} from={from} durationInFrames={duration} layout="none">
            <AbsoluteFill style={{ zIndex: photoUrls.length - i }}>
              <SplitSlide
                url={url}
                index={i}
                seed={seed}
                isLast={isLast}
                durationInFrames={duration}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      <TextOverlay
        text={`${city}, ${state}`}
        enterFrame={textEnterFrame}
        position="bottom"
      />
    </AbsoluteFill>
  );
};
