/**
 * SplitScreenShowcaseReel — variety alternate for reel days.
 *
 * Shares the exact props schema as SimpleShowcaseReel, so the template
 * selector can swap between them with zero data-plumbing changes.
 * Distinct look: two split-screen scenes (photos stacked top/bottom
 * with opposing Ken Burns moves) followed by a full-bleed closer with
 * the URL outro. 12s / 360 frames @ 30fps (132 + 132 + 120 − 2×12).
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { TextOverlay } from "../components/TextOverlay";
import { BrandBadge } from "../components/BrandBadge";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { pickTransition } from "../lib/transitions";
import { textEnterFrameFor } from "../lib/seeded";
import { simpleShowcaseReelSchema } from "./SimpleShowcaseReel";
import type { SimpleShowcaseReelProps } from "./SimpleShowcaseReel";

export const SPLIT_SHOWCASE_FPS = 30;
export const SPLIT_SHOWCASE_DURATION_FRAMES = 360; // 12s
const SPLIT_SCENE_FRAMES = 132;
const CLOSER_FRAMES = 120;
const TRANSITION_FRAMES = 12;
/** Global start frame of the closer scene. */
const CLOSER_START = 2 * SPLIT_SCENE_FRAMES - 2 * TRANSITION_FRAMES; // 240

export const splitScreenShowcaseReelSchema = simpleShowcaseReelSchema;

const SplitPair: React.FC<{
  topSrc: string;
  bottomSrc: string;
  durationInFrames: number;
  seed: number;
  pairIndex: number;
}> = ({ topSrc, bottomSrc, durationInFrames, seed, pairIndex }) => {
  return (
    <AbsoluteFill>
      <div style={{ position: "relative", width: "100%", height: "50%", overflow: "hidden" }}>
        <KenBurnsImage
          src={topSrc}
          durationInFrames={durationInFrames}
          seed={seed}
          slideIndex={pairIndex * 2}
          mode="in"
        />
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "50%",
          overflow: "hidden",
          borderTop: "4px solid rgba(255,255,255,0.9)",
        }}
      >
        <KenBurnsImage
          src={bottomSrc}
          durationInFrames={durationInFrames}
          seed={seed}
          slideIndex={pairIndex * 2 + 1}
          mode="out"
        />
      </div>
    </AbsoluteFill>
  );
};

export const SplitScreenShowcaseReel: React.FC<SimpleShowcaseReelProps> = ({
  photoUrls,
  brandName,
  brandLogoUrl,
  website,
  seed,
}) => {
  const urlEnterOffset = textEnterFrameFor(seed, "split-url", 15, 35);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <BackgroundMusic seed={seed} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SPLIT_SCENE_FRAMES}>
          <SplitPair
            topSrc={photoUrls[0]}
            bottomSrc={photoUrls[1]}
            durationInFrames={SPLIT_SCENE_FRAMES}
            seed={seed}
            pairIndex={0}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pickTransition(seed, 0)}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence durationInFrames={SPLIT_SCENE_FRAMES}>
          <SplitPair
            topSrc={photoUrls[2]}
            bottomSrc={photoUrls[3]}
            durationInFrames={SPLIT_SCENE_FRAMES}
            seed={seed}
            pairIndex={1}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pickTransition(seed, 1)}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        {/* Full-bleed closer — hero photo returns for the outro */}
        <TransitionSeries.Sequence durationInFrames={CLOSER_FRAMES}>
          <KenBurnsImage
            src={photoUrls[0]}
            durationInFrames={CLOSER_FRAMES}
            seed={seed}
            slideIndex={4}
            mode="in"
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <BrandBadge brandName={brandName} logoUrl={brandLogoUrl} />

      <Sequence from={CLOSER_START} layout="none">
        <TextOverlay
          text={website ?? "Link in bio"}
          enterFrame={urlEnterOffset}
          position="bottom"
          fontSize={56}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
