/**
 * Edit-style system — the "AutoCut themes" layer.
 *
 * A style bundles a coherent visual treatment: cut cadence, segment
 * entrance (transition), color grade, and effect toggles (flash, shake,
 * grain). The style is derived from the music track's mood, so the
 * visuals always match the sound: phonk gets glitch + grade, luxury
 * tracks get slow warm cuts, pop gets punches and flashes.
 *
 * Everything stays deterministic: same seed → same track → same style
 * → same edit.
 */
import { random } from "remotion";
import type { MusicTrack } from "./music";

export type EntranceKind = "punch" | "whip" | "zoomthrough" | "drift";

export type EditStyle = {
  key: "punchy" | "whip" | "vibe" | "luxe" | "soft";
  label: string;
  /** Minimum frames per segment (cut cadence). */
  minSegmentFrames: number;
  /** Multiplier for the opening segment hold. */
  firstSegmentMultiplier: number;
  entrance: EntranceKind;
  /** White flash accent on every Nth cut; 0 disables. */
  flashEvery: number;
  /** Seeded camera jitter for a few frames after each cut. */
  shake: boolean;
  /** Film grain overlay. */
  grain: boolean;
  /** CSS filter applied over the whole edit. */
  grade: string;
  /** Beat pulse amplitude (0 disables). */
  pulseAmp: number;
};

export const EDIT_STYLES: Record<EditStyle["key"], EditStyle> = {
  punchy: {
    key: "punchy",
    label: "Punchy",
    minSegmentFrames: 26,
    firstSegmentMultiplier: 2,
    entrance: "punch",
    flashEvery: 4,
    shake: false,
    grain: false,
    grade: "saturate(1.08) contrast(1.04)",
    pulseAmp: 0.025,
  },
  whip: {
    key: "whip",
    label: "Whip",
    minSegmentFrames: 24,
    firstSegmentMultiplier: 2,
    entrance: "whip",
    flashEvery: 0,
    shake: true,
    grain: false,
    grade: "saturate(1.12) contrast(1.05)",
    pulseAmp: 0.02,
  },
  vibe: {
    key: "vibe",
    label: "Vibe",
    minSegmentFrames: 28,
    firstSegmentMultiplier: 2.2,
    entrance: "zoomthrough",
    flashEvery: 4,
    shake: true,
    grain: true,
    grade: "saturate(1.25) contrast(1.15) brightness(0.96)",
    pulseAmp: 0.035,
  },
  luxe: {
    key: "luxe",
    label: "Luxe",
    minSegmentFrames: 48,
    firstSegmentMultiplier: 1.6,
    entrance: "drift",
    flashEvery: 0,
    shake: false,
    grain: true,
    grade: "saturate(0.92) contrast(1.06) sepia(0.12) brightness(1.02)",
    pulseAmp: 0.012,
  },
  soft: {
    key: "soft",
    label: "Soft",
    minSegmentFrames: 40,
    firstSegmentMultiplier: 1.8,
    entrance: "drift",
    flashEvery: 0,
    shake: false,
    grain: false,
    grade: "saturate(1.05) brightness(1.05) contrast(0.98)",
    pulseAmp: 0.015,
  },
};

/** Music mood → edit style. Upbeat tracks split punchy/whip by seed. */
export function pickEditStyleFor(
  track: MusicTrack | null,
  seed: number
): EditStyle {
  if (!track) return EDIT_STYLES.punchy;
  switch (track.mood) {
    case "modern":
      return EDIT_STYLES.vibe;
    case "elegant":
    case "acoustic":
      return EDIT_STYLES.luxe;
    case "chill":
      return EDIT_STYLES.soft;
    case "upbeat":
    default:
      return random(`style-${seed}`) < 0.5
        ? EDIT_STYLES.punchy
        : EDIT_STYLES.whip;
  }
}
