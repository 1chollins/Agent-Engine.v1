import { join } from "path";
import { existsSync } from "fs";

/**
 * Music track registry for reel background audio.
 *
 * Tracks live in public/music/. Every entry below corresponds to a file that
 * is actually on disk — an earlier version of this registry listed five
 * placeholder filenames (track-01-upbeat.mp3 and friends) that were never
 * created, so `existsSync` failed for all of them and every reel rendered
 * without any music at all.
 *
 * `bpm` is not decorative: video-stitch.ts quantises its cut points to this
 * tempo so shots change on the beat. A wrong value here puts every cut in the
 * reel slightly off the music. These figures were measured from the audio
 * (spectral-flux onset envelope + autocorrelation), not taken from the
 * publisher's metadata.
 *
 * Note on octave errors: if a measured value is exactly double or half the
 * "felt" tempo, cuts still land on beats, so it remains safe for stitching.
 *
 * Requirements for anything added here:
 * - Royalty-free / licensed for commercial use
 * - At least ~45s long (it gets trimmed to the reel length)
 * - Measure the BPM rather than guessing it
 */

type MusicTrack = {
  id: string;
  filename: string;
  name: string;
  mood: "upbeat" | "chill" | "elegant" | "inspiring" | "warm";
  bpm: number;
};

const TRACKS: MusicTrack[] = [
  // --- elegant: luxury listings, high-end finishes ---
  { id: "luxury-01", filename: "kulakovka-luxury-277105.mp3", name: "Luxury", mood: "elegant", bpm: 115.9 },
  { id: "luxury-02", filename: "soundsurfer-luxury-hotel-262366.mp3", name: "Luxury Hotel", mood: "elegant", bpm: 92.0 },
  { id: "luxury-03", filename: "solarflex-marketing-558242.mp3", name: "Marketing", mood: "elegant", bpm: 115.8 },

  // --- chill: relaxed, understated ---
  { id: "chill-01", filename: "kulakovka-chill-deep-house-295875.mp3", name: "Chill Deep House", mood: "chill", bpm: 117.0 },
  { id: "chill-02", filename: "kulakovka-chill-house-291448.mp3", name: "Chill House", mood: "chill", bpm: 120.0 },
  { id: "chill-03", filename: "sigmamusicart-lofi-lofi-background-music-388291.mp3", name: "Lofi Background", mood: "chill", bpm: 90.0 },
  { id: "chill-04", filename: "bransboynd-tropical-deep-house-518360.mp3", name: "Tropical Deep House", mood: "chill", bpm: 109.9 },

  // --- upbeat: bright, high-energy ---
  { id: "upbeat-01", filename: "gr0za-pop-upbeat-pop-music-557576.mp3", name: "Upbeat Pop", mood: "upbeat", bpm: 119.9 },
  { id: "upbeat-02", filename: "korshunmusic-happy-pop-summer-549011.mp3", name: "Happy Pop Summer", mood: "upbeat", bpm: 116.0 },
  { id: "upbeat-03", filename: "atlasaudio-house-518082.mp3", name: "House", mood: "upbeat", bpm: 119.9 },
  { id: "upbeat-04", filename: "atlasaudio-house-522425.mp3", name: "House II", mood: "upbeat", bpm: 146.6 },
  { id: "upbeat-05", filename: "quincy-house-beach-house-dance-529950.mp3", name: "Beach House Dance", mood: "upbeat", bpm: 107.4 },
  { id: "upbeat-06", filename: "sunset-house-grooves-deep-house-sunset-538759.mp3", name: "Deep House Sunset", mood: "upbeat", bpm: 122.5 },
  { id: "upbeat-07", filename: "kulakovka-pop-278476.mp3", name: "Pop", mood: "upbeat", bpm: 123.9 },
  { id: "upbeat-08", filename: "kulakovka-fashion-pop-308487.mp3", name: "Fashion Pop", mood: "upbeat", bpm: 119.9 },
  { id: "upbeat-09", filename: "absounds-funk-groove-255656.mp3", name: "Funk Groove", mood: "upbeat", bpm: 119.9 },
  { id: "upbeat-10", filename: "kulakovka-funk-291461.mp3", name: "Funk", mood: "upbeat", bpm: 123.9 },
  { id: "upbeat-11", filename: "the_mountain-funk-485565.mp3", name: "Funk II", mood: "upbeat", bpm: 105.0 },
  { id: "upbeat-12", filename: "kulakovka-groove-266611.mp3", name: "Groove", mood: "upbeat", bpm: 99.0 },
  { id: "upbeat-13", filename: "kontraa-untouchable-afro-pop-music-557406.mp3", name: "Untouchable", mood: "upbeat", bpm: 100.0 },
  { id: "upbeat-14", filename: "kontraa-update-afro-pop-music-445657.mp3", name: "Update", mood: "upbeat", bpm: 133.3 },
  { id: "upbeat-15", filename: "kontraa-water-afro-pop-music-445661.mp3", name: "Water", mood: "upbeat", bpm: 146.6 },

  // --- inspiring: acoustic, aspirational ---
  { id: "inspire-01", filename: "onaldin_music-inspire-indie-acoustic-distant-skyline-333168.mp3", name: "Distant Skyline", mood: "inspiring", bpm: 110.0 },
  { id: "inspire-02", filename: "tunetank-upbeat-acoustic-guitar-347972.mp3", name: "Upbeat Acoustic Guitar", mood: "inspiring", bpm: 100.1 },
  { id: "inspire-03", filename: "artmanzh-jazz-funk-groove-instrumental-222618.mp3", name: "Jazz Funk Groove", mood: "inspiring", bpm: 85.0 },

  // --- warm: coastal / island, suits SWFL waterfront ---
  { id: "warm-01", filename: "echogatestudios-island-days-417706.mp3", name: "Island Days", mood: "warm", bpm: 96.0 },
  { id: "warm-02", filename: "joyinsound-island-groove-398361.mp3", name: "Island Groove", mood: "warm", bpm: 84.0 },
  { id: "warm-03", filename: "konten_kreator-island-breeze-jam-part-4-316903.mp3", name: "Island Breeze Jam", mood: "warm", bpm: 84.0 },
  { id: "warm-04", filename: "sunset-house-grooves-tropical-house-paradise-538758.mp3", name: "Tropical House Paradise", mood: "warm", bpm: 99.4 },
  { id: "warm-05", filename: "alex-morgan-reggae-island-vibes-537451.mp3", name: "Reggae Island Vibes", mood: "warm", bpm: 158.4 },
  { id: "warm-06", filename: "the_mountain-hiphop-background-496550.mp3", name: "Hiphop Background", mood: "warm", bpm: 91.9 },

  // Deliberately excluded, though present in public/music/:
  //   absolutesound-hard-phonk-phonk-music-529766.mp3
  //   alex-morgan-phonk-brazilian-phonk-phonk-music-545509.mp3
  // Hard phonk reads as aggressive and does not suit a property listing.
  // Add them back only if a brand tone specifically calls for it.
];

const MOOD_FOR_TONE: Record<string, MusicTrack["mood"]> = {
  professional: "inspiring",
  friendly: "upbeat",
  luxury: "elegant",
  casual: "chill",
  warm: "warm",
};

/**
 * Small deterministic hash so a given listing/day always resolves to the same
 * track. Serverless instances don't share memory, so the previous
 * module-level "last track" guard could not actually prevent repeats — two
 * reels in the same package could land on the same song.
 */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Selects a music track for a reel, matching brand tone where possible.
 *
 * Pass a `seed` (e.g. `${listingId}-${dayNumber}`) to get a stable choice that
 * still varies across the days of a package.
 */
export function selectMusicTrack(
  brandTone?: string,
  seed?: string
): MusicTrack & { path: string } {
  const musicDir = join(process.cwd(), "public", "music");
  const pathFor = (t: MusicTrack) => join(musicDir, t.filename);

  const available = TRACKS.filter((t) => existsSync(pathFor(t)));
  const pool = available.length > 0 ? available : TRACKS;

  const preferredMood = brandTone ? MOOD_FOR_TONE[brandTone] : undefined;
  const matched = preferredMood
    ? pool.filter((t) => t.mood === preferredMood)
    : [];
  const candidates = matched.length > 0 ? matched : pool;

  const index = seed
    ? hashSeed(seed) % candidates.length
    : Math.floor(Math.random() * candidates.length);
  const selected = candidates[index];

  return { ...selected, path: pathFor(selected) };
}

export function getAllTracks(): MusicTrack[] {
  return [...TRACKS];
}
