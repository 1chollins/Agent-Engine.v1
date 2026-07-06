/**
 * Seed-derived render parameters.
 *
 * All "randomness" flows through Remotion's deterministic random(): the same
 * seed always produces the same video, so Inngest retries render identical
 * output. Never use Math.random() in compositions.
 */
import { random } from "remotion";

export type PanDirection = "left" | "right" | "up" | "down";

const DIRECTIONS: PanDirection[] = ["left", "right", "up", "down"];

/** Per-slide pan direction for the Ken Burns move. */
export function panDirectionFor(seed: number, slideIndex: number): PanDirection {
  const r = random(`pan-${seed}-${slideIndex}`);
  return DIRECTIONS[Math.floor(r * DIRECTIONS.length)];
}

/**
 * Zoom origin as CSS transform-origin percentages, kept within the central
 * region (30–70%) so the move never reveals the image edge.
 */
export function zoomOriginFor(
  seed: number,
  slideIndex: number
): { x: number; y: number } {
  return {
    x: 30 + random(`ox-${seed}-${slideIndex}`) * 40,
    y: 30 + random(`oy-${seed}-${slideIndex}`) * 40,
  };
}

/** Frame at which a text overlay begins its entrance (varies per render). */
export function textEnterFrameFor(
  seed: number,
  key: string,
  minFrame: number,
  maxFrame: number
): number {
  return Math.round(minFrame + random(`text-${seed}-${key}`) * (maxFrame - minFrame));
}
