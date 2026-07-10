/**
 * GridCollageReel — variant of SimpleShowcaseReel (shares its schema, so
 * the selector can swap them with zero data plumbing).
 *
 * Look: opens on a 2×2 collage of all four photos (cells stagger in,
 * seeded order), then cuts to full-screen highlights of photos 2–4 with
 * Ken Burns and seeded transitions. 12s @ 9:16, 360 frames @ 30fps.
 * Timing: four 99-frame acts, three 12-frame transitions (4×99 − 3×12).
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  random,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { z } from "zod";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { TextOverlay } from "../components/TextOverlay";
import { BrandBadge } from "../components/BrandBadge";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { pickTransition } from "../lib/transitions";
import { textEnterFrameFor } from "../lib/seeded";

export const GRID_COLLAGE_FPS = 30;
export const GRID_COLLAGE_DURATION_FRAMES = 360; // 12s
const ACT_FRAMES = 99;
const TRANSITION_FRAMES = 12;
const LAST_ACT_START = 3 * ACT_FRAMES - 3 * TRANSITION_FRAMES; // 261

export const gridCollageReelSchema = z.object({
  photoUrls: z.array(z.string()).length(4),
  brandName: z.string(),
  brandLogoUrl: z.string(),
  website: z.string().nullable(),
  seed: z.number(),
});

export type GridCollageReelProps = z.infer<typeof gridCollageReelSchema>;

/** Seeded permutation of [0,1,2,3] — the order cells pop in. */
function cellOrder(seed: number): number[] {
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random(`grid-order-${seed}-${i}`) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

const GridIntro: React.FC<{ photoUrls: string[]; seed: number }> = ({
  photoUrls,
  seed,
}) => {
  const frame = useCurrentFrame();
  const order = cellOrder(seed);

  return (
    <AbsoluteFill style={{ backgroundColor: "black", padding: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 12,
          width: "100%",
          height: "100%",
        }}
      >
        {photoUrls.map((url, i) => {
          const appearAt = order.indexOf(i) * 10;
          const t = interpolate(frame - appearAt, [0, 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                overflow: "hidden",
                borderRadius: 16,
                opacity: t,
                transform: `scale(${0.92 + 0.08 * t})`,
              }}
            >
              <Img
                src={url}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const GridCollageReel: React.FC<GridCollageReelProps> = ({
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
        <TransitionSeries.Sequence durationInFrames={ACT_FRAMES}>
          <GridIntro photoUrls={photoUrls} seed={seed} />
        </TransitionSeries.Sequence>
        {photoUrls.slice(1).map((url, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Transition
              presentation={pickTransition(seed, i)}
              timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
            />
            <TransitionSeries.Sequence durationInFrames={ACT_FRAMES}>
              <KenBurnsImage
                src={url}
                durationInFrames={ACT_FRAMES}
                seed={seed}
                slideIndex={i + 1}
              />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>

      <BrandBadge brandName={brandName} logoUrl={brandLogoUrl} />

      {/* URL outro on the final act */}
      <Sequence from={LAST_ACT_START} layout="none">
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
