/**
 * Background music manifest + seeded track picker.
 *
 * Tracks live in `public/audio/` (Remotion's staticFile root is the
 * project-level `public/` folder). Every filename listed here MUST
 * exist on disk — a missing file fails the render.
 *
 * Source: Pixabay Music (license covers commercial/client use, no
 * attribution required). Download tracks and name them to match.
 */
import { random } from "remotion";

export type MusicTrack = {
  /** Path relative to public/, e.g. "audio/upbeat-1.mp3" */
  file: string;
  label: string;
};

/**
 * Add/remove entries to match the files in public/audio/.
 * Empty list = compositions render silent (no crash).
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  { file: "audio/upbeat-1.mp3", label: "Upbeat 1" },
  { file: "audio/upbeat-2.mp3", label: "Upbeat 2" },
  { file: "audio/ambient-1.mp3", label: "Ambient 1" },
  { file: "audio/ambient-2.mp3", label: "Ambient 2" },
  { file: "audio/warm-1.mp3", label: "Warm 1" },
];

/** Deterministic per-seed track choice; null when no tracks installed. */
export function pickTrackFor(seed: number): MusicTrack | null {
  if (MUSIC_TRACKS.length === 0) {
    return null;
  }
  const i = Math.floor(random(`music-${seed}`) * MUSIC_TRACKS.length);
  return MUSIC_TRACKS[i];
}
