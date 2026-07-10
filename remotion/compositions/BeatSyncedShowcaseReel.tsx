/**
 * BeatSyncedShowcaseReel — AutoCut-style edit: every cut lands exactly
 * on a beat of the (seeded) background track. Variant of
 * SimpleShowcaseReel (shares its schema, so the selector can swap them
 * with zero data plumbing).
 *
 * Grammar (all beat-driven, all deterministic from the seed):
 *  - hard cuts snapped to the beats nearest the 25/50/75% marks
 *  - each new slide enters with a punch-in (scale 1.14 → 1.0)
 *  - a 4-frame white flash fires on every cut
 *  - between cuts, slides "pulse" (+3% scale, fast decay) on each beat
 *    (every 2nd beat for tracks ≥ 140 BPM so it never feels jittery)
 *
 * 12s @ 9:16, 360 frames @ 30fps.
 */
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { TextOverlay } from "../components/TextOverlay";
import { BrandBadge } from "../components/BrandBadge";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { pickTrackFor, beatFramesFor } from "../lib/music";
import { textEnterFrameFor } from "../lib/seeded";

export const BEAT_SYNCED_FPS = 30;
export const BEAT_SYNCED_DURATION_FRAMES = 360; // 12s
const PUNCH_FRAMES = 8;
const FLASH_FRAMES = 4;
const PULSE_DECAY_FRAMES = 7;
const MIN_CUT_GAP = 45; // never two cuts within 1.5s

export const beatSyncedShowcaseReelSchema = z.object({
  photoUrls: z.array(z.string()).length(4),
  brandName: z.string(),
  brandLogoUrl: z.string(),
  website: z.string().nullable(),
  seed: z.number(),
});

export type BeatSyncedShowcaseReelProps = z.infer<
  typeof beatSyncedShowcaseReelSchema
>;

/** Snap each target frame to the nearest beat, keeping cuts ordered
 *  and at least MIN_CUT_GAP apart. */
function pickCutFrames(beats: number[], targets: number[]): number[] {
  const cuts: number[] = [];
  for (const target of targets) {
    let best: number | null = null;
    for (const b of beats) {
      const prev = cuts[cuts.length - 1] ?? 0;
      if (b <= prev + MIN_CUT_GAP) continue;
      if (b >= BEAT_SYNCED_DURATION_FRAMES - MIN_CUT_GAP) break;
      if (best === null || Math.abs(b - target) < Math.abs(best - target)) {
        best = b;
      }
    }
    cuts.push(best ?? target);
  }
  return cuts;
}

export const BeatSyncedShowcaseReel: React.FC<BeatSyncedShowcaseReelProps> = ({
  photoUrls,
  brandName,
  brandLogoUrl,
  website,
  seed,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const track = pickTrackFor(seed);
  // Fallback grid (silent library): a steady 120 BPM equivalent.
  const beats = track
    ? beatFramesFor(track, fps, durationInFrames)
    : Array.from({ length: 24 }, (_, k) => k * 15);

  // Pulse on every beat, every 2nd beat for fast tracks.
  const pulseBeats =
    track && track.bpm >= 140 ? beats.filter((_, k) => k % 2 === 0) : beats;

  const cuts = pickCutFrames(beats, [90, 180, 270]);
  const slideStarts = [0, ...cuts];
  const slideEnds = [...cuts, durationInFrames];

  // Beat pulse: +3% scale snapping back over PULSE_DECAY_FRAMES.
  let pulse = 1;
  for (let i = pulseBeats.length - 1; i >= 0; i--) {
    if (pulseBeats[i] <= frame) {
      const dt = frame - pulseBeats[i];
      pulse = 1 + 0.03 * Math.max(0, 1 - dt / PULSE_DECAY_FRAMES);
      break;
    }
  }

  const urlEnterOffset = textEnterFrameFor(seed, "url", 10, 25);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <BackgroundMusic seed={seed} />

      {photoUrls.map((url, i) => {
        const start = slideStarts[i];
        const end = slideEnds[i];
        const duration = end - start;
        return (
          <Sequence key={i} from={start} durationInFrames={duration} layout="none">
            <PunchSlide
              url={url}
              slideIndex={i}
              seed={seed}
              durationInFrames={duration}
              punchIn={i > 0}
              pulse={pulse}
            />
          </Sequence>
        );
      })}

      {/* White flash on every cut */}
      {cuts.map((cut, i) => (
        <Sequence key={`flash-${i}`} from={cut} durationInFrames={FLASH_FRAMES} layout="none">
          <Flash />
        </Sequence>
      ))}

      <BrandBadge brandName={brandName} logoUrl={brandLogoUrl} />

      {/* URL outro on the final slide */}
      <Sequence from={slideStarts[3]} layout="none">
        <TextOverlay
          text={website ?? "Link in bio"}
          enterFrame={urlEnterOffset}
          position="bottom"
          fontSize={56}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

const PunchSlide: React.FC<{
  url: string;
  slideIndex: number;
  seed: number;
  durationInFrames: number;
  punchIn: boolean;
  pulse: number;
}> = ({ url, slideIndex, seed, durationInFrames, punchIn, pulse }) => {
  const frame = useCurrentFrame(); // local to the Sequence

  const punch = punchIn
    ? interpolate(frame, [0, PUNCH_FRAMES], [1.14, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <AbsoluteFill style={{ transform: `scale(${punch * pulse})` }}>
      <KenBurnsImage
        src={url}
        durationInFrames={durationInFrames}
        seed={seed}
        slideIndex={slideIndex}
      />
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, FLASH_FRAMES], [0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "white", opacity, zIndex: 5 }} />
  );
};
