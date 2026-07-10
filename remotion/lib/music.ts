/**
 * Background music manifest + seeded track picker.
 *
 * Tracks live in `public/music/` (Remotion's staticFile root is the
 * project-level `public/` folder). Every filename listed here MUST
 * exist on disk — a missing file fails the render.
 *
 * Source: Pixabay Music (license covers commercial/client use, no
 * attribution required). Download tracks and name them to match.
 *
 * `mood` is currently informational: the default picker draws from the
 * whole library. It exists so a future "pick a vibe" or "match music to
 * listing" feature only needs a filtered pickTrackForMood call, not a
 * manifest rework.
 */
import { random } from "remotion";

export type MusicMood = "upbeat" | "chill" | "elegant" | "acoustic" | "modern";

export type MusicTrack = {
  /** Path relative to public/, e.g. "music/tropical-1.mp3" */
  file: string;
  label: string;
  mood: MusicMood;
};

/**
 * Add/remove entries to match the files in public/music/.
 * Empty list = compositions render silent (no crash).
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  // ---- Upbeat: pop, funk, afrobeat, house ----
  { file: "music/atlasaudio-house-518082.mp3", label: "House 1", mood: "upbeat" },
  { file: "music/atlasaudio-house-522425.mp3", label: "House 2", mood: "upbeat" },
  { file: "music/gr0za-pop-upbeat-pop-music-557576.mp3", label: "Upbeat Pop", mood: "upbeat" },
  { file: "music/korshunmusic-happy-pop-summer-549011.mp3", label: "Happy Pop Summer", mood: "upbeat" },
  { file: "music/kulakovka-fashion-pop-308487.mp3", label: "Fashion Pop", mood: "upbeat" },
  { file: "music/kulakovka-pop-278476.mp3", label: "Pop", mood: "upbeat" },
  { file: "music/kulakovka-funk-291461.mp3", label: "Funk", mood: "upbeat" },
  { file: "music/kulakovka-groove-266611.mp3", label: "Groove", mood: "upbeat" },
  { file: "music/absounds-funk-groove-255656.mp3", label: "Funk Groove", mood: "upbeat" },
  { file: "music/the_mountain-funk-485565.mp3", label: "Funk 2", mood: "upbeat" },
  { file: "music/kontraa-water-afro-pop-music-445661.mp3", label: "Water Afro-Pop", mood: "upbeat" },
  { file: "music/kontraa-update-afro-pop-music-445657.mp3", label: "Update Afro-Pop", mood: "upbeat" },
  { file: "music/kontraa-untouchable-afro-pop-music-557406.mp3", label: "Untouchable Afro-Pop", mood: "upbeat" },
  { file: "music/quincy-house-beach-house-dance-529950.mp3", label: "Beach House Dance", mood: "upbeat" },
  { file: "music/solarflex-marketing-558242.mp3", label: "Marketing", mood: "upbeat" },

  // ---- Chill: lofi, chill house, island/coastal ----
  { file: "music/bransboynd-tropical-deep-house-518360.mp3", label: "Tropical Deep House", mood: "chill" },
  { file: "music/kulakovka-chill-deep-house-295875.mp3", label: "Chill Deep House", mood: "chill" },
  { file: "music/kulakovka-chill-house-291448.mp3", label: "Chill House", mood: "chill" },
  { file: "music/sigmamusicart-lofi-lofi-background-music-388291.mp3", label: "Lofi Background", mood: "chill" },
  { file: "music/sunset-house-grooves-deep-house-sunset-538759.mp3", label: "Deep House Sunset", mood: "chill" },
  { file: "music/sunset-house-grooves-tropical-house-paradise-538758.mp3", label: "Tropical House Paradise", mood: "chill" },
  { file: "music/echogatestudios-island-days-417706.mp3", label: "Island Days", mood: "chill" },
  { file: "music/joyinsound-island-groove-398361.mp3", label: "Island Groove", mood: "chill" },
  { file: "music/konten_kreator-island-breeze-jam-part-4-316903.mp3", label: "Island Breeze Jam", mood: "chill" },
  { file: "music/alex-morgan-reggae-island-vibes-537451.mp3", label: "Reggae Island Vibes", mood: "chill" },

  // ---- Elegant: luxury listings ----
  { file: "music/kulakovka-luxury-277105.mp3", label: "Luxury", mood: "elegant" },
  { file: "music/soundsurfer-luxury-hotel-262366.mp3", label: "Luxury Hotel", mood: "elegant" },
  { file: "music/artmanzh-jazz-funk-groove-instrumental-222618.mp3", label: "Jazz Funk Groove", mood: "elegant" },

  // ---- Acoustic: warm, personal ----
  { file: "music/onaldin_music-inspire-indie-acoustic-distant-skyline-333168.mp3", label: "Indie Acoustic", mood: "acoustic" },
  { file: "music/tunetank-upbeat-acoustic-guitar-347972.mp3", label: "Upbeat Acoustic Guitar", mood: "acoustic" },

  // ---- Modern: phonk, hip-hop (trending reel sounds) ----
  { file: "music/absolutesound-hard-phonk-phonk-music-529766.mp3", label: "Hard Phonk", mood: "modern" },
  { file: "music/alex-morgan-phonk-brazilian-phonk-phonk-music-545509.mp3", label: "Brazilian Phonk", mood: "modern" },
  { file: "music/the_mountain-hiphop-background-496550.mp3", label: "Hip-Hop Background", mood: "modern" },
];

/** Deterministic per-seed track choice; null when no tracks installed. */
export function pickTrackFor(seed: number): MusicTrack | null {
  if (MUSIC_TRACKS.length === 0) {
    return null;
  }
  const i = Math.floor(random(`music-${seed}`) * MUSIC_TRACKS.length);
  return MUSIC_TRACKS[i];
}

/**
 * Mood-filtered variant for future vibe selection. Falls back to the
 * full library if the mood has no tracks.
 */
export function pickTrackForMood(seed: number, mood: MusicMood): MusicTrack | null {
  const pool = MUSIC_TRACKS.filter((t) => t.mood === mood);
  if (pool.length === 0) {
    return pickTrackFor(seed);
  }
  const i = Math.floor(random(`music-${seed}`) * pool.length);
  return pool[i];
}
