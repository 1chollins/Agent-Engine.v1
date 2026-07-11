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
  key: "punchy" | "whip" | "vibe" | "luxe" | "soft" | "hyper" | "retro" | "bounce";
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
  // The maximal AutoCut: fastest cuts, zoom-throughs, flash on every other
  // beat, camera shake, heavy grade. TikTok-speed energy.
  hyper: {
    key: "hyper",
    label: "Hyper",
    minSegmentFrames: 18,
    firstSegmentMultiplier: 1.8,
    entrance: "zoomthrough",
    flashEvery: 2,
    shake: true,
    grain: false,
    grade: "saturate(1.3) contrast(1.18) brightness(1.02)",
    pulseAmp: 0.045,
  },
  // Faded film look: whip cuts, grain, warm washed-out grade — the
  // nostalgic "shot on film" edit that's everywhere on IG.
  retro: {
    key: "retro",
    label: "Retro",
    minSegmentFrames: 32,
    firstSegmentMultiplier: 2,
    entrance: "whip",
    flashEvery: 0,
    shake: false,
    grain: true,
    grade: "saturate(0.85) contrast(0.96) sepia(0.22) brightness(1.06) hue-rotate(-8deg)",
    pulseAmp: 0.02,
  },
  // Playful pop: punch entrances with a big beat pulse and bright grade —
  // the whole frame bounces with the music.
  bounce: {
    key: "bounce",
    label: "Bounce",
    minSegmentFrames: 22,
    firstSegmentMultiplier: 2,
    entrance: "punch",
    flashEvery: 3,
    shake: false,
    grain: false,
    grade: "saturate(1.18) contrast(1.06) brightness(1.04)",
    pulseAmp: 0.06,
  },
};

/**
 * Music mood → edit style. Every mood now has 2–4 candidate styles and the
 * seed picks one, so two reels on the same kind of track still cut
 * differently. Deterministic: same seed → same pick.
 */
export function pickEditStyleFor(
  track: MusicTrack | null,
  seed: number
): EditStyle {
  if (!track) return EDIT_STYLES.punchy;
  const pick = (candidates: EditStyle["key"][]): EditStyle => {
    const i = Math.floor(random(`style-${seed}`) * candidates.length);
    return EDIT_STYLES[candidates[Math.min(i, candidates.length - 1)]];
  };
  switch (track.mood) {
    case "modern":
      return pick(["vibe", "hyper", "bounce"]);
    case "elegant":
    case "acoustic":
      return pick(["luxe", "retro"]);
    case "chill":
      return pick(["soft", "retro"]);
    case "upbeat":
    default:
      return pick(["punchy", "whip", "bounce", "hyper"]);
  }
}
