import React from "react";
import { Composition } from "remotion";
import { loadInterFonts } from "./lib/fonts";
import {
  TripleSlideStory,
  tripleSlideStorySchema,
  TRIPLE_SLIDE_DURATION_FRAMES,
  TRIPLE_SLIDE_FPS,
} from "./compositions/TripleSlideStory";
import {
  SimpleShowcaseReel,
  simpleShowcaseReelSchema,
  SHOWCASE_DURATION_FRAMES,
  SHOWCASE_FPS,
} from "./compositions/SimpleShowcaseReel";
import {
  FourSceneStory,
  fourSceneStorySchema,
  FOUR_SCENE_DURATION_FRAMES,
  FOUR_SCENE_FPS,
} from "./compositions/FourSceneStory";
import {
  JustListedReel,
  justListedReelSchema,
  JUST_LISTED_DURATION_FRAMES,
  JUST_LISTED_FPS,
} from "./compositions/JustListedReel";
import {
  ZoomRevealStory,
  zoomRevealStorySchema,
  ZOOM_REVEAL_DURATION_FRAMES,
  ZOOM_REVEAL_FPS,
} from "./compositions/ZoomRevealStory";
import {
  SplitScreenShowcaseReel,
  splitScreenShowcaseReelSchema,
  SPLIT_SHOWCASE_DURATION_FRAMES,
  SPLIT_SHOWCASE_FPS,
} from "./compositions/SplitScreenShowcaseReel";

/**
 * Composition registry. IDs here become the render targets in Phase 3
 * (replacing Creatomate template UUIDs / env vars).
 *
 * Default props are placeholders for Remotion Studio preview only —
 * production props are injected per render.
 */

loadInterFonts();

const PLACEHOLDER_PHOTOS = [
  "https://picsum.photos/seed/exterior/1600/1067",
  "https://picsum.photos/seed/kitchen/1600/1067",
  "https://picsum.photos/seed/pool/1067/1600",
  "https://picsum.photos/seed/living/1600/1067",
  "https://picsum.photos/seed/bedroom/1600/1067",
];

const W = 1080;
const H = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ---- Stories ---- */}
      <Composition
        id="TripleSlideStory"
        component={TripleSlideStory}
        schema={tripleSlideStorySchema}
        width={W}
        height={H}
        fps={TRIPLE_SLIDE_FPS}
        durationInFrames={TRIPLE_SLIDE_DURATION_FRAMES}
        defaultProps={{
          photoUrls: PLACEHOLDER_PHOTOS.slice(0, 3),
          city: "Fort Myers",
          state: "FL",
          seed: 42,
        }}
      />
      <Composition
        id="ZoomRevealStory"
        component={ZoomRevealStory}
        schema={zoomRevealStorySchema}
        width={W}
        height={H}
        fps={ZOOM_REVEAL_FPS}
        durationInFrames={ZOOM_REVEAL_DURATION_FRAMES}
        defaultProps={{
          photoUrls: PLACEHOLDER_PHOTOS.slice(0, 3),
          city: "Fort Myers",
          state: "FL",
          seed: 42,
        }}
      />
      <Composition
        id="FourSceneStory"
        component={FourSceneStory}
        schema={fourSceneStorySchema}
        width={W}
        height={H}
        fps={FOUR_SCENE_FPS}
        durationInFrames={FOUR_SCENE_DURATION_FRAMES}
        defaultProps={{
          photoUrls: PLACEHOLDER_PHOTOS.slice(0, 4),
          city: "Fort Myers",
          beds: 3,
          baths: 2,
          sqft: 1842,
          address: "17420 Birchwood Ln",
          website: "frameandformstudio.com",
          seed: 42,
        }}
      />

      {/* ---- Reels ---- */}
      <Composition
        id="SimpleShowcaseReel"
        component={SimpleShowcaseReel}
        schema={simpleShowcaseReelSchema}
        width={W}
        height={H}
        fps={SHOWCASE_FPS}
        durationInFrames={SHOWCASE_DURATION_FRAMES}
        defaultProps={{
          photoUrls: PLACEHOLDER_PHOTOS.slice(0, 4),
          brandName: "Frame & Form Realty",
          brandLogoUrl: "",
          website: "frameandformstudio.com",
          seed: 42,
        }}
      />
      <Composition
        id="SplitScreenShowcaseReel"
        component={SplitScreenShowcaseReel}
        schema={splitScreenShowcaseReelSchema}
        width={W}
        height={H}
        fps={SPLIT_SHOWCASE_FPS}
        durationInFrames={SPLIT_SHOWCASE_DURATION_FRAMES}
        defaultProps={{
          photoUrls: PLACEHOLDER_PHOTOS.slice(0, 4),
          brandName: "Frame & Form Realty",
          brandLogoUrl: "",
          website: "frameandformstudio.com",
          seed: 42,
        }}
      />
      <Composition
        id="JustListedReel"
        component={JustListedReel}
        schema={justListedReelSchema}
        width={W}
        height={H}
        fps={JUST_LISTED_FPS}
        durationInFrames={JUST_LISTED_DURATION_FRAMES}
        defaultProps={{
          heroLabel: "Just Listed",
          addressLine1: "17420 Birchwood Ln",
          addressLine2: "Fort Myers, FL 33908",
          details1: ["3 Beds", "2 Baths", "1,842 sqft"],
          details2: ["$425,000", "0.28 acre lot", "Built 2019"],
          photoUrls: PLACEHOLDER_PHOTOS,
          agentName: "Colby Hollins",
          brandName: "Frame & Form Realty",
          phone: "(239) 555-0142",
          email: "contact@frameandformstudio.com",
          agentHeadshotUrl: "https://picsum.photos/seed/agent/600/600",
          seed: 42,
        }}
      />
    </>
  );
};
