/**
 * KenBurnsImage — the core visual block for all video pieces.
 *
 * Two layers:
 *  1. Background: the same photo, cover-fit, heavily blurred and slightly
 *     darkened — fills the 9:16 frame so landscape photos never letterbox
 *     to black and are never cropped (replaces Creatomate Defect B fix
 *     and the planned Phase 2 blurred-fill in one).
 *  2. Foreground: contain-fit photo with the Ken Burns move — scale
 *     100% → 105% (house standard: subtle, nearly imperceptible) plus a
 *     seeded pan direction and zoom origin, so every render differs.
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Easing,
  useCurrentFrame,
} from "remotion";
import { panDirectionFor, zoomOriginFor } from "../lib/seeded";
import type { PanDirection } from "../lib/seeded";

const KEN_BURNS_SCALE_START = 1.0;
const KEN_BURNS_SCALE_END = 1.05;
/** Max pan distance in px at full 1080×1920 resolution. */
const PAN_DISTANCE_PX = 24;

function panOffset(
  direction: PanDirection,
  progress: number
): { x: number; y: number } {
  const d = PAN_DISTANCE_PX * progress;
  switch (direction) {
    case "left":
      return { x: -d, y: 0 };
    case "right":
      return { x: d, y: 0 };
    case "up":
      return { x: 0, y: -d };
    case "down":
      return { x: 0, y: d };
  }
}

type KenBurnsImageProps = {
  src: string;
  /** Total frames this image is on screen (its Sequence duration). */
  durationInFrames: number;
  seed: number;
  slideIndex: number;
};

export const KenBurnsImage: React.FC<KenBurnsImageProps> = ({
  src,
  durationInFrames,
  seed,
  slideIndex,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });

  const scale = interpolate(
    progress,
    [0, 1],
    [KEN_BURNS_SCALE_START, KEN_BURNS_SCALE_END]
  );
  const direction = panDirectionFor(seed, slideIndex);
  const origin = zoomOriginFor(seed, slideIndex);
  const { x, y } = panOffset(direction, progress);

  return (
    <AbsoluteFill>
      {/* Blurred fill background — static, cover-fit */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(40px) brightness(0.7)",
            transform: "scale(1.15)", // hide blur edge bleed
          }}
        />
      </AbsoluteFill>

      {/* Foreground photo — contain-fit with Ken Burns move */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
          transformOrigin: `${origin.x}% ${origin.y}%`,
        }}
      >
        <Img
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
