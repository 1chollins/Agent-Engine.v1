/**
 * SimpleShowcaseReel — Remotion replacement for the Creatomate
 * "reel_simple_showcase" template (de8d6882).
 *
 * Spec parity: 4 photos, brand overlay, URL outro. 12s @ 9:16.
 * Timing: 360 frames @ 30fps. Four 99-frame slides, three 12-frame
 * seeded transitions (4×99 − 3×12 = 360).
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { z } from "zod";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { TextOverlay } from "../components/TextOverlay";
import { BrandBadge } from "../components/BrandBadge";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { pickTransition } from "../lib/transitions";
import { textEnterFrameFor } from "../lib/seeded";

export const SHOWCASE_FPS = 30;
export const SHOWCASE_DURATION_FRAMES = 360; // 12s
const SLIDE_FRAMES = 99;
const TRANSITION_FRAMES = 12;
/** Frame at which the final slide begins (3 slides + 3 transitions before it). */
const LAST_SLIDE_START = 3 * SLIDE_FRAMES - 3 * TRANSITION_FRAMES; // 261

export const simpleShowcaseReelSchema = z.object({
  photoUrls: z.array(z.string()).length(4),
  brandName: z.string(),
  brandLogoUrl: z.string(),
  website: z.string().nullable(),
  seed: z.number(),
});

export type SimpleShowcaseReelProps = z.infer<typeof simpleShowcaseReelSchema>;

export const SimpleShowcaseReel: React.FC<SimpleShowcaseReelProps> = ({
  photoUrls,
  brandName,
  brandLogoUrl,
  website,
  seed,
}) => {
  const urlEnterOffset = textEnterFrameFor(seed, "url", 15, 35);

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
              />
            </TransitionSeries.Sequence>
            {i < photoUrls.length - 1 ? (
              <TransitionSeries.Transition
                presentation={pickTransition(seed, i)}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />
            ) : null}
          </React.Fragment>
        ))}
      </TransitionSeries>

      <BrandBadge brandName={brandName} logoUrl={brandLogoUrl} />

      {/* URL outro on the final slide */}
      <Sequence from={LAST_SLIDE_START} layout="none">
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
