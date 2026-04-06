import { join } from "path";
import { existsSync } from "fs";

/**
 * Music track registry for reel background audio.
 *
 * Tracks are stored in public/music/ as MP3 files.
 * To add real royalty-free tracks, replace the placeholder files
 * and update the metadata below.
 *
 * Requirements:
 * - All tracks must be royalty-free / licensed for commercial use
 * - Duration: 30-60 seconds (will be trimmed to match video length)
 * - Format: MP3, 128kbps+
 */

type MusicTrack = {
  id: string;
  filename: string;
  name: string;
  mood: "upbeat" | "chill" | "elegant" | "inspiring" | "warm";
  bpm: number;
};

const TRACKS: MusicTrack[] = [
  {
    id: "track-01",
    filename: "track-01-upbeat.mp3",
    name: "Bright Horizons",
    mood: "upbeat",
    bpm: 120,
  },
  {
    id: "track-02",
    filename: "track-02-chill.mp3",
    name: "Afternoon Glow",
    mood: "chill",
    bpm: 90,
  },
  {
    id: "track-03",
    filename: "track-03-elegant.mp3",
    name: "Marble & Gold",
    mood: "elegant",
    bpm: 100,
  },
  {
    id: "track-04",
    filename: "track-04-inspiring.mp3",
    name: "New Beginnings",
    mood: "inspiring",
    bpm: 110,
  },
  {
    id: "track-05",
    filename: "track-05-warm.mp3",
    name: "Welcome Home",
    mood: "warm",
    bpm: 95,
  },
];

let lastTrackId: string | null = null;

/**
 * Selects a music track for a reel, avoiding consecutive repeats.
 * Maps brand tone to preferred mood for better matching.
 */
export function selectMusicTrack(
  brandTone?: string
): MusicTrack & { path: string } {
  const moodPreference: Record<string, string> = {
    professional: "inspiring",
    friendly: "upbeat",
    luxury: "elegant",
    casual: "chill",
  };

  const preferredMood = brandTone ? moodPreference[brandTone] : undefined;

  // Filter available tracks (those with files on disk)
  const available = TRACKS.filter((t) => {
    const path = join(process.cwd(), "public", "music", t.filename);
    return existsSync(path);
  });

  // If no tracks on disk, return the first track definition anyway
  // (stitching will handle missing music gracefully)
  const pool = available.length > 0 ? available : TRACKS;

  // Prefer mood-matched tracks, exclude last used
  let candidates = pool.filter(
    (t) => t.id !== lastTrackId && t.mood === preferredMood
  );

  // Fall back to any non-repeat
  if (candidates.length === 0) {
    candidates = pool.filter((t) => t.id !== lastTrackId);
  }

  // Fall back to anything
  if (candidates.length === 0) {
    candidates = pool;
  }

  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  lastTrackId = selected.id;

  return {
    ...selected,
    path: join(process.cwd(), "public", "music", selected.filename),
  };
}

export function getAllTracks(): MusicTrack[] {
  return [...TRACKS];
}
