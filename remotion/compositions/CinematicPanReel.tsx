/**
 * CinematicPanReel — variant of SimpleShowcaseReel (shares its schema, so
 * the selector can swap them with zero data plumbing).
 *
 * Look: widescreen letterbox bars, slow alternating Ken Burns in/out,
 * fade-only cuts, the brand name held in small caps at the top and a
 * quiet URL outro. The calm, "listing film" alternative to the
 * energetic showcase cuts. 12s @ 9:16, 360 frames @ 30fps.
 * Timing: four 99-frame slides, three 12-frame fades (4×99 − 3×12).
 */
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { z } from "zod";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { TextOverlay } from "../components/TextOverlay";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { textEnterFrameFor } from "../lib/seeded";

export const CINEMATIC_PAN_FPS = 30;
export const CINEMATIC_PAN_DURATION_FRAMES = 360; // 12s
const SLIDE_FRAMES = 99;
const TRANSITION_FRAMES = 12;
const LAST_SLIDE_START = 3 * SLIDE_FRAMES - 3 * TRANSITION_FRAMES; // 261
const BAR_HEIGHT_PCT = 13;

export const cinematicPanReelSchema = z.object({
  photoUrls: z.array(z.string()).length(4),
  brandName: z.string(),
  brandLogoUrl: z.string(),
  website: z.string().nullable(),
  seed: z.number(),
});

export type CinematicPanReelProps = z.infer<typeof cinematicPanReelSchema>;

const LetterboxBars: React.FC = () => {
  const frame = useCurrentFrame();
  // Bars slide in over the first 20 frames for a "film starting" feel.
  const inset = interpolate(frame, [0, 20], [0, BAR_HEIGHT_PCT], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bar: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    height: `${inset}%`,
    backgroundColor: "black",
    zIndex: 10,
  };
  return (
    <>
      <div style={{ ...bar, top: 0 }} />
      <div style={{ ...bar, bottom: 0 }} />
    </>
  );
};

export const CinematicPanReel: React.FC<CinematicPanReelProps> = ({
  photoUrls,
  brandName,
  website,
  seed,
}) => {
  const frame = useCurrentFrame();
  const urlEnterOffset = textEnterFrameFor(seed, "url", 15, 35);
  const titleOpacity = interpolate(frame, [25, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
                mode={i % 2 === 0 ? "in" : "out"}
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

      <LetterboxBars />

      {/* Brand name held in small caps just below the top bar */}
      {brandName ? (
        <div
          style={{
            position: "absolute",
            top: `${BAR_HEIGHT_PCT + 2}%`,
            width: "100%",
            textAlign: "center",
            zIndex: 11,
            opacity: titleOpacity,
            color: "white",
            fontFamily: "Inter, sans-serif",
            fontSize: 34,
            fontWeight: 500,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            textShadow: "0 2px 12px rgba(0,0,0,0.55)",
          }}
        >
          {brandName}
        </div>
      ) : null}

      {/* URL outro on the final slide, above the bottom bar */}
      <Sequence from={LAST_SLIDE_START} layout="none">
        <div style={{ position: "absolute", inset: 0, bottom: `${BAR_HEIGHT_PCT}%`, zIndex: 11 }}>
          <TextOverlay
            text={website ?? "Link in bio"}
            enterFrame={urlEnterOffset}
            position="bottom"
            fontSize={48}
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
