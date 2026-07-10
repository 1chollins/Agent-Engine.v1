/**
 * Background music manifest + seeded track picker + beat grid.
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
 * listing" feature only needs a filtered pickTrackForMood call.
 *
 * `bpm` / `firstBeatSec` were measured offline (spectral-flux onset
 * envelope + autocorrelation over the first 60s of each file, tempo
 * octave-folded into [90, 180)). They drive beat-synced compositions:
 * beat k lands at firstBeatSec + k * 60 / bpm seconds from track start.
 * BackgroundMusic plays every track from t=0, so these offsets map
 * directly onto composition frames.
 */
import { random } from "remotion";

export type MusicMood = "upbeat" | "chill" | "elegant" | "acoustic" | "modern";

export type MusicTrack = {
  /** Path relative to public/, e.g. "music/tropical-1.mp3" */
  file: string;
  label: string;
  mood: MusicMood;
  /** Measured tempo, octave-folded into [90, 180). */
  bpm: number;
  /** Seconds from track start to the first detected beat. */
  firstBeatSec: number;
};

/**
 * Add/remove entries to match the files in public/music/.
 * Empty list = compositions render silent (no crash).
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  // ---- Upbeat: pop, funk, afrobeat, house ----
  { file: "music/atlasaudio-house-518082.mp3", label: "House 1", mood: "upbeat", bpm: 120, firstBeatSec: 0.766 },
  { file: "music/atlasaudio-house-522425.mp3", label: "House 2", mood: "upbeat", bpm: 125, firstBeatSec: 0.789 },
  { file: "music/gr0za-pop-upbeat-pop-music-557576.mp3", label: "Upbeat Pop", mood: "upbeat", bpm: 120, firstBeatSec: 0.511 },
  { file: "music/korshunmusic-happy-pop-summer-549011.mp3", label: "Happy Pop Summer", mood: "upbeat", bpm: 115, firstBeatSec: 0.325 },
  { file: "music/kulakovka-fashion-pop-308487.mp3", label: "Fashion Pop", mood: "upbeat", bpm: 120, firstBeatSec: 0.766 },
  { file: "music/kulakovka-pop-278476.mp3", label: "Pop", mood: "upbeat", bpm: 120.5, firstBeatSec: 0.325 },
  { file: "music/kulakovka-funk-291461.mp3", label: "Funk", mood: "upbeat", bpm: 120.5, firstBeatSec: 0.464 },
  { file: "music/kulakovka-groove-266611.mp3", label: "Groove", mood: "upbeat", bpm: 98, firstBeatSec: 0.209 },
  { file: "music/absounds-funk-groove-255656.mp3", label: "Funk Groove", mood: "upbeat", bpm: 120, firstBeatSec: 0.023 },
  { file: "music/the_mountain-funk-485565.mp3", label: "Funk 2", mood: "upbeat", bpm: 138, firstBeatSec: 0.372 },
  { file: "music/kontraa-water-afro-pop-music-445661.mp3", label: "Water Afro-Pop", mood: "upbeat", bpm: 146, firstBeatSec: 0.697 },
  { file: "music/kontraa-update-afro-pop-music-445657.mp3", label: "Update Afro-Pop", mood: "upbeat", bpm: 98, firstBeatSec: 0.255 },
  { file: "music/kontraa-untouchable-afro-pop-music-557406.mp3", label: "Untouchable Afro-Pop", mood: "upbeat", bpm: 98, firstBeatSec: 0.186 },
  { file: "music/quincy-house-beach-house-dance-529950.mp3", label: "Beach House Dance", mood: "upbeat", bpm: 142, firstBeatSec: 0.813 },
  { file: "music/solarflex-marketing-558242.mp3", label: "Marketing", mood: "upbeat", bpm: 115, firstBeatSec: 0.418 },

  // ---- Chill: lofi, chill house, island/coastal ----
  { file: "music/bransboynd-tropical-deep-house-518360.mp3", label: "Tropical Deep House", mood: "chill", bpm: 146, firstBeatSec: 0.116 },
  { file: "music/kulakovka-chill-deep-house-295875.mp3", label: "Chill Deep House", mood: "chill", bpm: 115, firstBeatSec: 0.209 },
  { file: "music/kulakovka-chill-house-291448.mp3", label: "Chill House", mood: "chill", bpm: 120, firstBeatSec: 0.766 },
  { file: "music/sigmamusicart-lofi-lofi-background-music-388291.mp3", label: "Lofi Background", mood: "chill", bpm: 176, firstBeatSec: 0.139 },
  { file: "music/sunset-house-grooves-deep-house-sunset-538759.mp3", label: "Deep House Sunset", mood: "chill", bpm: 122, firstBeatSec: 0.348 },
  { file: "music/sunset-house-grooves-tropical-house-paradise-538758.mp3", label: "Tropical House Paradise", mood: "chill", bpm: 98, firstBeatSec: 0.046 },
  { file: "music/echogatestudios-island-days-417706.mp3", label: "Island Days", mood: "chill", bpm: 94, firstBeatSec: 0.464 },
  { file: "music/joyinsound-island-groove-398361.mp3", label: "Island Groove", mood: "chill", bpm: 138, firstBeatSec: 0.186 },
  { file: "music/konten_kreator-island-breeze-jam-part-4-316903.mp3", label: "Island Breeze Jam", mood: "chill", bpm: 165, firstBeatSec: 0.441 },
  { file: "music/alex-morgan-reggae-island-vibes-537451.mp3", label: "Reggae Island Vibes", mood: "chill", bpm: 157, firstBeatSec: 0.116 },

  // ---- Elegant: luxury listings ----
  { file: "music/kulakovka-luxury-277105.mp3", label: "Luxury", mood: "elegant", bpm: 115, firstBeatSec: 0.372 },
  { file: "music/soundsurfer-luxury-hotel-262366.mp3", label: "Luxury Hotel", mood: "elegant", bpm: 91, firstBeatSec: 0.302 },
  { file: "music/artmanzh-jazz-funk-groove-instrumental-222618.mp3", label: "Jazz Funk Groove", mood: "elegant", bpm: 167, firstBeatSec: 0.255 },

  // ---- Acoustic: warm, personal ----
  { file: "music/onaldin_music-inspire-indie-acoustic-distant-skyline-333168.mp3", label: "Indie Acoustic", mood: "acoustic", bpm: 146, firstBeatSec: 0.441 },
  { file: "music/tunetank-upbeat-acoustic-guitar-347972.mp3", label: "Upbeat Acoustic Guitar", mood: "acoustic", bpm: 98, firstBeatSec: 0.046 },

  // ---- Modern: phonk, hip-hop (trending reel sounds) ----
  { file: "music/absolutesound-hard-phonk-phonk-music-529766.mp3", label: "Hard Phonk", mood: "modern", bpm: 178.5, firstBeatSec: 0.302 },
  { file: "music/alex-morgan-phonk-brazilian-phonk-phonk-music-545509.mp3", label: "Brazilian Phonk", mood: "modern", bpm: 125, firstBeatSec: 0.464 },
  { file: "music/the_mountain-hiphop-background-496550.mp3", label: "Hip-Hop Background", mood: "modern", bpm: 91, firstBeatSec: 0.093 },
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

/**
 * All beat positions (in frames) for a track within a composition,
 * assuming the audio plays from t=0 (which BackgroundMusic does).
 */
export function beatFramesFor(
  track: MusicTrack,
  fps: number,
  durationInFrames: number
): number[] {
  const beatDurSec = 60 / track.bpm;
  const frames: number[] = [];
  for (let k = 0; ; k++) {
    const f = Math.round((track.firstBeatSec + k * beatDurSec) * fps);
    if (f >= durationInFrames) break;
    frames.push(f);
  }
  return frames;
}
