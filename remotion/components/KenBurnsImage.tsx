/**
 * KenBurnsImage — the core visual block for all video pieces.
 *
 * Default ("cover"): the photo fills the frame and a real camera move plays
 * across it — a slow slide across the room, a push in, a pull back or a
 * rise — so a landscape listing photo reads like gimbal footage instead of
 * a strip floating in blurred bars. The move is pure geometry on the real
 * photo (pan / zoom of the pixels the photographer captured): nothing is
 * generated or altered, which keeps it safe for listing marketing.
 * Pan distance scales with time on screen, so short beat-synced cuts don't
 * whip and long holds still travel.
 *
 * "contain": the original look — whole photo, blurred fill behind, 100%→105%.
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Easing,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { panDirectionFor, zoomOriginFor } from "../lib/seeded";
import type { PanDirection } from "../lib/seeded";

const KEN_BURNS_SCALE_START = 1.0;
const KEN_BURNS_SCALE_END = 1.05;
/** Max pan distance in px at full 1080×1920 resolution (contain mode). */
const PAN_DISTANCE_PX = 24;

type CameraMove = "pan-left" | "pan-right" | "push" | "pull" | "rise";
const MOVES: CameraMove[] = ["pan-left", "pan-right", "pan-left", "pan-right", "push", "pull", "rise"];

function cameraMoveFor(seed: number, slideIndex: number, mode?: "in" | "out"): CameraMove {
  const m = MOVES[Math.floor(random(`cam-${seed}-${slideIndex}`) * MOVES.length)];
  if (mode === "out" && m === "push") return "pull";
  if (mode === "in" && m === "pull") return "push";
  return m;
}

function panOffset(direction: PanDirection, progress: number): { x: number; y: number } {
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
  /** "in" leans toward pushing in, "out" toward pulling back. */
  mode?: "in" | "out";
  fit?: "cover" | "contain";
  /** Darken/grade the photo (CSS filter), e.g. for the cinematic styles. */
  filter?: string;
};

export const KenBurnsImage: React.FC<KenBurnsImageProps> = ({
  src,
  durationInFrames,
  seed,
  slideIndex,
  mode,
  fit = "cover",
  filter,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (fit === "cover") {
    const p = interpolate(frame, [0, durationInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    });
    const move = cameraMoveFor(seed, slideIndex, mode);
    const seconds = durationInFrames / fps;
    const range = Math.max(16, Math.min(64, seconds * 22));
    const lo = 50 - range / 2;
    const hi = 50 + range / 2;
    let posX = 50;
    let posY = 50;
    let scale = 1;
    switch (move) {
      case "pan-left":
        posX = interpolate(p, [0, 1], [hi, lo]);
        scale = interpolate(p, [0, 1], [1.03, 1.08]);
        break;
      case "pan-right":
        posX = interpolate(p, [0, 1], [lo, hi]);
        scale = interpolate(p, [0, 1], [1.03, 1.08]);
        break;
      case "push":
        scale = interpolate(p, [0, 1], [1.0, 1.16]);
        break;
      case "pull":
        scale = interpolate(p, [0, 1], [1.16, 1.0]);
        break;
      case "rise":
        posY = interpolate(p, [0, 1], [62, 38]);
        scale = interpolate(p, [0, 1], [1.05, 1.12]);
        break;
    }
    const origin = zoomOriginFor(seed, slideIndex);
    return (
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${posX}% ${posY}%`,
            transform: `scale(${scale})`,
            transformOrigin: `${origin.x}% ${origin.y}%`,
            filter,
          }}
        />
      </AbsoluteFill>
    );
  }

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  const scale =
    mode !== "out"
      ? interpolate(progress, [0, 1], [KEN_BURNS_SCALE_START, KEN_BURNS_SCALE_END])
      : interpolate(progress, [0, 1], [KEN_BURNS_SCALE_END, KEN_BURNS_SCALE_START]);
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
        <Img src={src} style={{ width: "100%", height: "100%", objectFit: "contain", filter }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
