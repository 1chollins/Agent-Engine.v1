/**
 * PolaroidStackStory — variant of TripleSlideStory (shares its schema, so
 * the selector can swap them with zero data plumbing).
 *
 * Look: three polaroid-framed photos spring onto a cream (brand) canvas
 * one at a time, each with a seeded tilt and placement, stacking like
 * prints tossed on a table. City/state caption lands at the end.
 * 13s @ 9:16, 390 frames @ 30fps.
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { TextOverlay } from "../components/TextOverlay";

export const POLAROID_STACK_FPS = 30;
export const POLAROID_STACK_DURATION_FRAMES = 390; // 13s
const DROP_INTERVAL = 105; // a new polaroid every 3.5s
const CAPTION_FRAME = 315;

export const polaroidStackStorySchema = z.object({
  photoUrls: z.array(z.string()).length(3),
  city: z.string(),
  state: z.string(),
  seed: z.number(),
});

export type PolaroidStackStoryProps = z.infer<typeof polaroidStackStorySchema>;

/** Anchor placements — roughly top / middle / lower third of the frame. */
const ANCHORS = [
  { x: 90, y: 130 },
  { x: 230, y: 620 },
  { x: 130, y: 1100 },
];

const Polaroid: React.FC<{
  url: string;
  index: number;
  seed: number;
}> = ({ url, index, seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drop = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.9, stiffness: 120 },
  });

  const tilt = -9 + random(`tilt-${seed}-${index}`) * 18;
  const jitterX = -40 + random(`jx-${seed}-${index}`) * 80;
  const anchor = ANCHORS[index % ANCHORS.length];

  return (
    <div
      style={{
        position: "absolute",
        left: anchor.x + jitterX,
        top: anchor.y,
        width: 760,
        padding: "26px 26px 96px 26px",
        backgroundColor: "white",
        boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
        transform: `translateY(${interpolate(drop, [0, 1], [-1400, 0])}px) rotate(${tilt}deg)`,
      }}
    >
      <Img
        src={url}
        style={{
          width: "100%",
          height: 640,
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
};

export const PolaroidStackStory: React.FC<PolaroidStackStoryProps> = ({
  photoUrls,
  city,
  state,
  seed,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#f2ebd8" }}>
      <BackgroundMusic seed={seed} />

      {photoUrls.map((url, i) => (
        <Sequence key={i} from={i * DROP_INTERVAL} layout="none">
          <Polaroid url={url} index={i} seed={seed} />
        </Sequence>
      ))}

      {/* City/state caption near the end */}
      <Sequence from={CAPTION_FRAME} layout="none">
        <TextOverlay
          text={`${city}, ${state}`}
          enterFrame={0}
          position="bottom"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
