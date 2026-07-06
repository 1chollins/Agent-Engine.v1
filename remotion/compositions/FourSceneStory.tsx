/**
 * FourSceneStory — Remotion replacement for the Creatomate
 * "story_four_scene" template (f3727bc7).
 *
 * Spec parity: 4 scenes, each a photo background with its own text
 * overlay. 23s @ 9:16.
 * Timing: 690 frames @ 30fps. Four 180-frame scenes, three 10-frame
 * seeded transitions (4×180 − 3×10 = 690).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { z } from "zod";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { TextOverlay } from "../components/TextOverlay";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { pickTransition } from "../lib/transitions";
import { textEnterFrameFor } from "../lib/seeded";

export const FOUR_SCENE_FPS = 30;
export const FOUR_SCENE_DURATION_FRAMES = 690; // 23s
const SCENE_FRAMES = 180;
const TRANSITION_FRAMES = 10;

export const fourSceneStorySchema = z.object({
  photoUrls: z.array(z.string()).length(4),
  city: z.string(),
  beds: z.number(),
  baths: z.number(),
  sqft: z.number().nullable(),
  address: z.string(),
  website: z.string().nullable(),
  seed: z.number(),
});

export type FourSceneStoryProps = z.infer<typeof fourSceneStorySchema>;

export const FourSceneStory: React.FC<FourSceneStoryProps> = ({
  photoUrls,
  city,
  beds,
  baths,
  sqft,
  address,
  website,
  seed,
}) => {
  const sqftText = sqft ? ` · ${sqft.toLocaleString()} sqft` : "";

  // Mirrors the Text-1..Text-4 slots of the Creatomate template.
  const sceneTexts: string[] = [
    `New Listing: ${city}`,
    `${beds} bed · ${baths} bath${sqftText}`,
    address,
    website ?? "Link in bio for full tour",
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <BackgroundMusic seed={seed} />
      <TransitionSeries>
        {photoUrls.map((url, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
              <KenBurnsImage
                src={url}
                durationInFrames={SCENE_FRAMES}
                seed={seed}
                slideIndex={i}
              />
              <TextOverlay
                text={sceneTexts[i]}
                enterFrame={textEnterFrameFor(seed, `scene-${i}`, 10, 35)}
                position="bottom"
                fontSize={58}
              />
            </TransitionSeries.Sequence>
            {i < photoUrls.length - 1 ? (
              <TransitionSeries.Transition
                presentation={pickTransition(seed, i)}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />
            ) : null}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
