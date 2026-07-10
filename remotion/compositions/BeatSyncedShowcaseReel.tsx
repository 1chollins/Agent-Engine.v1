/**
 * BeatSyncedShowcaseReel — the AutoCut engine. Fast cuts locked to the
 * music's beat grid, wearing one of five edit styles derived from the
 * track's mood (see lib/editStyles.ts): Punchy, Whip, Vibe, Luxe, Soft.
 *
 * Variant of SimpleShowcaseReel (schema-compatible, so the selector
 * swaps it in with zero data plumbing). `styleOverride` exists for
 * Studio preview compositions only — production leaves it unset and
 * the style follows the seeded track's mood.
 *
 * Grammar (all deterministic from the seed):
 *  - hard cuts on beats, cadence set by the style (~0.8s-1.6s)
 *  - the 4 photos cycle with fresh seeded pans/zooms each appearance
 *  - style entrance on every cut: punch-in, whip-pan blur,
 *    zoom-through, or soft drift
 *  - optional: camera shake after cuts, flash accents, film grain,
 *    color grade, beat pulse
 *
 * 12s @ 9:16, 360 frames @ 30fps.
 */
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { TextOverlay } from "../components/TextOverlay";
import { BrandBadge } from "../components/BrandBadge";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { pickTrackFor, beatFramesFor } from "../lib/music";
import { EDIT_STYLES, pickEditStyleFor, type EditStyle } from "../lib/editStyles";
import { textEnterFrameFor } from "../lib/seeded";

export const BEAT_SYNCED_FPS = 30;
export const BEAT_SYNCED_DURATION_FRAMES = 360; // 12s
const ENTRANCE_FRAMES = 6;
const FLASH_FRAMES = 3;
const PULSE_DECAY_FRAMES = 6;
const SHAKE_FRAMES = 5;

export const beatSyncedShowcaseReelSchema = z.object({
  photoUrls: z.array(z.string()).length(4),
  brandName: z.string(),
  brandLogoUrl: z.string(),
  website: z.string().nullable(),
  seed: z.number(),
  /** Studio preview only — production derives the style from the track. */
  styleOverride: z
    .enum(["punchy", "whip", "vibe", "luxe", "soft"])
    .optional(),
});

export type BeatSyncedShowcaseReelProps = z.infer<
  typeof beatSyncedShowcaseReelSchema
>;

/** Cut at every beat that keeps segments at least the style's min length. */
function buildSegments(
  beats: number[],
  durationInFrames: number,
  style: EditStyle
): number[] {
  const starts = [0];
  for (const b of beats) {
    const prev = starts[starts.length - 1];
    const min =
      starts.length === 1
        ? Math.round(style.minSegmentFrames * style.firstSegmentMultiplier)
        : style.minSegmentFrames;
    if (b - prev >= min && b <= durationInFrames - style.minSegmentFrames) {
      starts.push(b);
    }
  }
  return starts;
}

export const BeatSyncedShowcaseReel: React.FC<BeatSyncedShowcaseReelProps> = ({
  photoUrls,
  brandName,
  brandLogoUrl,
  website,
  seed,
  styleOverride,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const track = pickTrackFor(seed);
  const style = styleOverride
    ? EDIT_STYLES[styleOverride]
    : pickEditStyleFor(track, seed);

  // Fallback grid (silent library): a steady 120 BPM equivalent.
  const beats = track
    ? beatFramesFor(track, fps, durationInFrames)
    : Array.from({ length: 24 }, (_, k) => k * 15);

  const starts = buildSegments(beats, durationInFrames, style);
  const lastStart = starts[starts.length - 1];

  // Beat pulse
  let pulse = 1;
  if (style.pulseAmp > 0) {
    for (let i = beats.length - 1; i >= 0; i--) {
      if (beats[i] <= frame) {
        const dt = frame - beats[i];
        pulse = 1 + style.pulseAmp * Math.max(0, 1 - dt / PULSE_DECAY_FRAMES);
        break;
      }
    }
  }

  const urlEnterOffset = textEnterFrameFor(seed, "url", 5, 15);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <BackgroundMusic seed={seed} />

      {/* Graded, pulsing stage */}
      <AbsoluteFill style={{ filter: style.grade }}>
        <AbsoluteFill style={{ transform: `scale(${pulse})` }}>
          {starts.map((start, i) => {
            const end = i < starts.length - 1 ? starts[i + 1] : durationInFrames;
            return (
              <Sequence
                key={i}
                from={start}
                durationInFrames={end - start}
                layout="none"
              >
                <StyledSegment
                  url={photoUrls[i % photoUrls.length]}
                  segmentIndex={i}
                  seed={seed}
                  durationInFrames={end - start}
                  isFirst={i === 0}
                  style={style}
                />
              </Sequence>
            );
          })}
        </AbsoluteFill>

        {style.grain && <FilmGrain seed={seed} />}
      </AbsoluteFill>

      {/* Flash accents */}
      {style.flashEvery > 0 &&
        starts
          .filter((_, i) => i > 0 && i % style.flashEvery === 0)
          .map((cut) => (
            <Sequence
              key={`flash-${cut}`}
              from={cut}
              durationInFrames={FLASH_FRAMES}
              layout="none"
            >
              <Flash />
            </Sequence>
          ))}

      <BrandBadge brandName={brandName} logoUrl={brandLogoUrl} />

      {/* URL outro on the final segment */}
      <Sequence from={lastStart} layout="none">
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

/** One segment wearing the style's entrance + optional shake. */
const StyledSegment: React.FC<{
  url: string;
  segmentIndex: number;
  seed: number;
  durationInFrames: number;
  isFirst: boolean;
  style: EditStyle;
}> = ({ url, segmentIndex, seed, durationInFrames, isFirst, style }) => {
  const frame = useCurrentFrame(); // local to the Sequence

  const t = interpolate(frame, [0, ENTRANCE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let transform = "";
  let filter = "";
  let opacity = 1;

  if (!isFirst) {
    switch (style.entrance) {
      case "punch": {
        transform = `scale(${1.1 - 0.1 * t})`;
        break;
      }
      case "whip": {
        const dir = random(`whip-${seed}-${segmentIndex}`) < 0.5 ? 1 : -1;
        transform = `translateX(${dir * 42 * (1 - t)}%)`;
        filter = `blur(${10 * (1 - t)}px)`;
        break;
      }
      case "zoomthrough": {
        transform = `scale(${1.55 - 0.55 * t})`;
        filter = `blur(${7 * (1 - t)}px)`;
        break;
      }
      case "drift": {
        transform = `scale(${1.05 - 0.05 * t})`;
        opacity = t;
        break;
      }
    }
  }

  // Camera shake: seeded jitter for a few frames after the cut
  let shakeX = 0;
  let shakeY = 0;
  if (style.shake && !isFirst && frame < ENTRANCE_FRAMES + SHAKE_FRAMES) {
    const decay = 1 - frame / (ENTRANCE_FRAMES + SHAKE_FRAMES);
    shakeX = (random(`sx-${seed}-${segmentIndex}-${frame}`) - 0.5) * 14 * decay;
    shakeY = (random(`sy-${seed}-${segmentIndex}-${frame}`) - 0.5) * 14 * decay;
  }

  return (
    <AbsoluteFill
      style={{
        transform: `${transform} translate(${shakeX}px, ${shakeY}px)`,
        filter: filter || undefined,
        opacity,
      }}
    >
      <KenBurnsImage
        src={url}
        durationInFrames={durationInFrames}
        seed={seed}
        slideIndex={segmentIndex}
        mode={segmentIndex % 2 === 0 ? "in" : "out"}
      />
    </AbsoluteFill>
  );
};

/** Subtle animated film grain via layered radial gradients. */
const FilmGrain: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  // Shift a repeating noise pattern every frame — reads as live grain.
  const ox = Math.floor(random(`gx-${seed}-${frame}`) * 200);
  const oy = Math.floor(random(`gy-${seed}-${frame}`) * 200);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.07,
        backgroundImage:
          "radial-gradient(circle at 20% 30%, white 0.5px, transparent 1px)," +
          "radial-gradient(circle at 70% 60%, white 0.5px, transparent 1px)," +
          "radial-gradient(circle at 45% 85%, white 0.5px, transparent 1px)",
        backgroundSize: "37px 41px, 53px 47px, 61px 59px",
        backgroundPosition: `${ox}px ${oy}px, ${-oy}px ${ox}px, ${oy}px ${-ox}px`,
        mixBlendMode: "overlay",
      }}
    />
  );
};

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, FLASH_FRAMES], [0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "white", opacity, zIndex: 5 }} />
  );
};
