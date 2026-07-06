/**
 * Background music manifest + seeded track picker.
 *
 * Tracks live in `public/music/` (Remotion's staticFile root is the
 * project-level `public/` folder). Every filename listed here MUST
 * exist on disk — a missing file fails the render.
 *
 * Source: Pixabay Music (license covers commercial/client use, no
 * attribution required). Download tracks and name them to match.
 */
import { random } from "remotion";

export type MusicTrack = {
  /** Path relative to public/, e.g. "music/tropical-1.mp3" */
  file: string;
  label: string;
};

/**
 * Add/remove entries to match the files in public/music/.
 * Empty list = compositions render silent (no crash).
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  { file: "music/atlasaudio-house-518082.mp3", label: "House 1" },
  { file: "music/atlasaudio-house-522425.mp3", label: "House 2" },
  { file: "music/bransboynd-tropical-deep-house-518360.mp3", label: "Tropical Deep House" },
  { file: "music/gr0za-pop-upbeat-pop-music-557576.mp3", label: "Upbeat Pop" },
  { file: "music/korshunmusic-happy-pop-summer-549011.mp3", label: "Happy Pop Summer" },
  { file: "music/kulakovka-chill-deep-house-295875.mp3", label: "Chill Deep House" },
  { file: "music/kulakovka-chill-house-291448.mp3", label: "Chill House" },
  { file: "music/onaldin_music-inspire-indie-acoustic-distant-skyline-333168.mp3", label: "Indie Acoustic" },
  { file: "music/quincy-house-beach-house-dance-529950.mp3", label: "Beach House Dance" },
  { file: "music/sigmamusicart-lofi-lofi-background-music-388291.mp3", label: "Lofi Background" },
  { file: "music/sunset-house-grooves-deep-house-sunset-538759.mp3", label: "Deep House Sunset" },
  { file: "music/sunset-house-grooves-tropical-house-paradise-538758.mp3", label: "Tropical House Paradise" },
  { file: "music/the_mountain-hiphop-background-496550.mp3", label: "Hip-Hop Background" },
  { file: "music/tunetank-upbeat-acoustic-guitar-347972.mp3", label: "Upbeat Acoustic Guitar" },
];

/** Deterministic per-seed track choice; null when no tracks installed. */
export function pickTrackFor(seed: number): MusicTrack | null {
  if (MUSIC_TRACKS.length === 0) {
    return null;
  }
  const i = Math.floor(random(`music-${seed}`) * MUSIC_TRACKS.length);
  return MUSIC_TRACKS[i];
}
