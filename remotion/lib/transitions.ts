/**
 * Seeded transition picker — variety beyond Creatomate's fixed templates.
 * Each cut deterministically picks fade / slide / wipe (and a direction)
 * from the seed, so the same seed always produces the same edit.
 */
import { random } from "remotion";
import type { TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

type SlideDirection = "from-left" | "from-right" | "from-top" | "from-bottom";

const SLIDE_DIRECTIONS: SlideDirection[] = [
  "from-left",
  "from-right",
  "from-top",
  "from-bottom",
];

const WIPE_DIRECTIONS = ["from-left", "from-right"] as const;

export function pickTransition(
  seed: number,
  cutIndex: number
): TransitionPresentation<Record<string, unknown>> {
  const r = random(`cut-${seed}-${cutIndex}`);

  if (r < 0.5) {
    // Fade stays the most common — it's the safest look for real estate.
    return fade() as TransitionPresentation<Record<string, unknown>>;
  }
  if (r < 0.8) {
    const d =
      SLIDE_DIRECTIONS[
        Math.floor(random(`slide-${seed}-${cutIndex}`) * SLIDE_DIRECTIONS.length)
      ];
    return slide({ direction: d }) as TransitionPresentation<
      Record<string, unknown>
    >;
  }
  const d =
    WIPE_DIRECTIONS[
      Math.floor(random(`wipe-${seed}-${cutIndex}`) * WIPE_DIRECTIONS.length)
    ];
  return wipe({ direction: d }) as TransitionPresentation<
    Record<string, unknown>
  >;
}
