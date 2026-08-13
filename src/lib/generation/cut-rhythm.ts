/**
 * The edit's sense of rhythm.
 *
 * The previous planner chose one hold length and gave it to every shot in the
 * reel. Every cut landed on the beat, which was correct, and the result still
 * read as flat — because a cut that arrives at exactly the same interval for
 * forty seconds is a metronome, and a metronome is the one rhythm the ear stops
 * hearing. Beat-synced was never the missing piece; *variation* was.
 *
 * So holds now come from a phrase: a short repeating pattern of 2-, 4- and
 * 8-beat holds that tightens and releases across the reel. Every value is a
 * power of two, so every cut still lands on a bar or half-bar line and nothing
 * stumbles. What changes is that the viewer can no longer predict the next one.
 *
 * Which phrase a reel gets is seeded off the listing and the day, so two reels
 * in the same package cut differently while a re-render of one day reproduces
 * itself exactly.
 */

/** Holds in beats. Every phrase totals 32 beats — eight bars — so a cycle
 *  resolves on a phrase boundary of the music rather than partway through. */
type CutPhrase = {
  id: string;
  beats: number[];
};

const CUT_PHRASES: CutPhrase[] = [
  // Opens wide, tightens through the middle, releases. The safest all-rounder.
  { id: "establish", beats: [8, 4, 4, 2, 2, 4, 8] },
  // Steady acceleration — each pass through cuts faster than the last.
  { id: "build", beats: [4, 4, 4, 2, 2, 2, 2, 4, 8] },
  // Front-loaded energy for bright, high-tempo tracks.
  { id: "punch", beats: [2, 2, 4, 4, 2, 2, 8, 4, 4] },
  // Long, luxurious holds. Suits elegant tracks and high-end property.
  { id: "slow_burn", beats: [8, 8, 4, 2, 2, 4, 4] },
  // Rapid opening burst that opens out into long holds.
  { id: "staccato", beats: [2, 2, 2, 2, 4, 4, 8, 8] },
];

/**
 * A camera move applied across a single shot.
 *
 * Motion on every shot is worse than motion on none — continuous drift reads as
 * seasickness and the eye stops trusting the frame. Roughly a quarter of shots
 * are deliberately left still, which also gives the moving ones something to be
 * different from.
 */
export type ZoomMove = "in" | "out" | "none";

/** Total scale travelled across a shot that has a move. ~6% is the point where
 *  the movement is felt but not noticed as an effect. */
export const ZOOM_TRAVEL = 0.06;

/** Deterministic Fisher–Yates. Same seed → same order, no selection bias. */
function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const a = [...items];
  let s = seed >>> 0;
  const next = () => {
    s = (s * 1664525 + 1013904223) >>> 0; // LCG (Numerical Recipes)
    return s / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deterministic 32-bit string hash (FNV-1a). */
export function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export type CutPlan = {
  /** Hold length in seconds for each shot, frame-snapped, in order. */
  segments: number[];
  /** Start time in seconds of each shot. */
  offsets: number[];
  totalDuration: number;
  /** Camera move for each shot. */
  moves: ZoomMove[];
  /** Which phrase was used — recorded so a reel that reads badly is diagnosable. */
  phraseId: string;
};

/**
 * Plans the cut points and camera moves for one reel.
 *
 * Two editorial rules override the phrase, because a phrase alone produces a
 * reel that starts and ends arbitrarily:
 *
 *   - The first shot gets a 4-beat hold. Eight beats is too slow to open on and
 *     two is too abrupt to read before the viewer has decided to stay.
 *   - The last shot gets the longest hold available. A reel that stops mid-burst
 *     feels truncated; one that lands on a held frame feels finished.
 *
 * Every hold is clamped to the footage that actually exists, then snapped to a
 * whole frame — ffmpeg encodes whole frames, and unsnapped fractions accumulate
 * into drift across the reel.
 */
export function planCutRhythm(
  clipDurations: number[],
  bpm: number,
  seed: string,
  fps: number,
  variantIndex = 0,
): CutPlan {
  const beat = 60 / bpm;
  const rand = hashSeed(seed);

  // Phrases are drawn from a per-listing shuffle and indexed by the reel's day,
  // not picked by hashing the day directly. Hashing looked fine and wasn't:
  // `listing-2`, `listing-8` and `listing-11` collided mod 5, so four of the
  // five reels in a package came out on the same phrase. Indexing a shuffle
  // makes distinctness structural instead of probabilistic — with reel days
  // spaced three apart and five phrases available, every reel in a package is
  // guaranteed a different rhythm.
  const deck = seededShuffle(CUT_PHRASES, rand);
  const phrase = deck[variantIndex % deck.length];

  const count = clipDurations.length;
  const longest = Math.max(...phrase.beats);

  const segments: number[] = [];
  const offsets: number[] = [];
  const moves: ZoomMove[] = [];
  let clock = 0;

  for (let i = 0; i < count; i++) {
    let beats: number;
    if (i === 0) {
      beats = 4;
    } else if (i === count - 1) {
      beats = longest;
    } else {
      // Offset by one so the phrase's own opening hold isn't wasted on the shot
      // that already has a fixed opening hold.
      beats = phrase.beats[(i - 1) % phrase.beats.length];
    }

    let hold = beats * beat;

    // Never ask for more footage than the clip has. If even a single beat
    // overruns it, use the clip whole rather than trimming past its end.
    const available = clipDurations[i];
    if (hold > available) hold = Math.max(Math.min(beat, available), available);

    const frames = Math.max(1, Math.round(hold * fps));
    hold = frames / fps;

    offsets.push(clock);
    segments.push(hold);
    clock += hold;

    // Alternate push and pull so consecutive shots never travel the same way,
    // and leave every fourth shot still.
    if (i % 4 === 3) {
      moves.push("none");
    } else {
      moves.push((i + rand) % 2 === 0 ? "in" : "out");
    }
  }

  return {
    segments,
    offsets,
    totalDuration: clock,
    moves,
    phraseId: phrase.id,
  };
}

/**
 * The zoompan `z` expression for one shot.
 *
 * zoompan is driven by the output frame counter `on`, so travel is expressed as
 * a per-frame step over the shot's own length rather than as a fixed rate — a
 * two-second shot and an eight-second shot then move by the same total amount
 * instead of the long one drifting four times as far.
 */
export function zoomExpression(move: ZoomMove, frames: number): string | null {
  if (move === "none" || frames <= 1) return null;
  const step = (ZOOM_TRAVEL / frames).toFixed(6);
  const peak = (1 + ZOOM_TRAVEL).toFixed(4);
  return move === "in"
    ? `min(1+${step}*on,${peak})`
    : `max(${peak}-${step}*on,1)`;
}
