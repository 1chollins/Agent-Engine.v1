/**
 * Sound design for reels — short original effects in public/sfx/, placed so
 * their peak lands on the cut (or the moment) they accent.
 *
 * <CutSfx cuts={[...]}> puts a whoosh on each cut, alternating two whooshes
 * and skipping cuts that come too close together (rapid-fire whooshes on a
 * beat-synced edit sound like a machine gun). <SfxAt> places one effect.
 */
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

export type SfxName = "whoosh-1" | "whoosh-2" | "swish-soft" | "impact" | "riser" | "chime";

/** Seconds from file start to the loudest point of each effect. */
const PEAK_SEC: Record<SfxName, number> = {
  "whoosh-1": 0.41,
  "whoosh-2": 0.35,
  "swish-soft": 0.33,
  impact: 0.06,
  riser: 0.99,
  chime: 0.05,
};

const LENGTH_SEC: Record<SfxName, number> = {
  "whoosh-1": 0.58,
  "whoosh-2": 0.5,
  "swish-soft": 0.68,
  impact: 1.68,
  riser: 1.08,
  chime: 1.88,
};

/** One effect whose peak lands on `at` (composition frame). */
export const SfxAt: React.FC<{
  name: SfxName;
  at: number;
  volume?: number;
  fps?: number;
}> = ({ name, at, volume = 0.5, fps = 30 }) => {
  const from = Math.round(at - PEAK_SEC[name] * fps);
  if (from < 0) return null;
  return (
    <Sequence from={from} durationInFrames={Math.ceil(LENGTH_SEC[name] * fps) + 2} layout="none">
      <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
    </Sequence>
  );
};

/** Whooshes on cuts. `soft` uses the gentle swish (fades, calm styles). */
export const CutSfx: React.FC<{
  cuts: number[];
  soft?: boolean;
  volume?: number;
  minGapFrames?: number;
  fps?: number;
}> = ({ cuts, soft = false, volume, minGapFrames = 20, fps = 30 }) => {
  const kept: number[] = [];
  for (const c of [...cuts].sort((a, b) => a - b)) {
    if (kept.length === 0 || c - kept[kept.length - 1] >= minGapFrames) kept.push(c);
  }
  return (
    <>
      {kept.map((c, i) => (
        <SfxAt
          key={`${c}-${i}`}
          name={soft ? "swish-soft" : i % 2 === 0 ? "whoosh-1" : "whoosh-2"}
          at={c}
          volume={volume ?? (soft ? 0.32 : 0.42)}
          fps={fps}
        />
      ))}
    </>
  );
};
