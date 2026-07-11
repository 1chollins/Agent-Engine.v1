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
import {
  GridCollageReel,
  gridCollageReelSchema,
  GRID_COLLAGE_DURATION_FRAMES,
  GRID_COLLAGE_FPS,
} from "./compositions/GridCollageReel";
import {
  CinematicPanReel,
  cinematicPanReelSchema,
  CINEMATIC_PAN_DURATION_FRAMES,
  CINEMATIC_PAN_FPS,
} from "./compositions/CinematicPanReel";
import {
  BeatSyncedShowcaseReel,
  beatSyncedShowcaseReelSchema,
  BEAT_SYNCED_DURATION_FRAMES,
  BEAT_SYNCED_FPS,
} from "./compositions/BeatSyncedShowcaseReel";
import {
  PolaroidStackStory,
  polaroidStackStorySchema,
  POLAROID_STACK_DURATION_FRAMES,
  POLAROID_STACK_FPS,
} from "./compositions/PolaroidStackStory";
import {
  SplitRevealStory,
  splitRevealStorySchema,
  SPLIT_REVEAL_DURATION_FRAMES,
  SPLIT_REVEAL_FPS,
} from "./compositions/SplitRevealStory";
import {
  AnimatedQuickPost,
  animatedQuickPostSchema,
  ANIMATED_QUICK_POST_DURATION_FRAMES,
  ANIMATED_QUICK_POST_FPS,
} from "./compositions/AnimatedQuickPost";

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

      <Composition
        id="PolaroidStackStory"
        component={PolaroidStackStory}
        schema={polaroidStackStorySchema}
        width={W}
        height={H}
        fps={POLAROID_STACK_FPS}
        durationInFrames={POLAROID_STACK_DURATION_FRAMES}
        defaultProps={{
          photoUrls: PLACEHOLDER_PHOTOS.slice(0, 3),
          city: "Fort Myers",
          state: "FL",
          seed: 42,
        }}
      />
      <Composition
        id="SplitRevealStory"
        component={SplitRevealStory}
        schema={splitRevealStorySchema}
        width={W}
        height={H}
        fps={SPLIT_REVEAL_FPS}
        durationInFrames={SPLIT_REVEAL_DURATION_FRAMES}
        defaultProps={{
          photoUrls: PLACEHOLDER_PHOTOS.slice(0, 3),
          city: "Fort Myers",
          state: "FL",
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
        id="BeatSyncedShowcaseReel"
        component={BeatSyncedShowcaseReel}
        schema={beatSyncedShowcaseReelSchema}
        width={W}
        height={H}
        fps={BEAT_SYNCED_FPS}
        durationInFrames={BEAT_SYNCED_DURATION_FRAMES}
        defaultProps={{
          photoUrls: PLACEHOLDER_PHOTOS.slice(0, 4),
          brandName: "Frame & Form Realty",
          brandLogoUrl: "",
          website: "frameandformstudio.com",
          seed: 42,
        }}
      />
      {/* ---- Edit-style previews (Studio only; production derives the
           style from the seeded track's mood) ---- */}
      {(["punchy", "whip", "vibe", "luxe", "soft", "hyper", "retro", "bounce"] as const).map((styleKey, i) => (
        <Composition
          key={styleKey}
          id={`BeatSynced-${styleKey.charAt(0).toUpperCase()}${styleKey.slice(1)}`}
          component={BeatSyncedShowcaseReel}
          schema={beatSyncedShowcaseReelSchema}
          width={W}
          height={H}
          fps={BEAT_SYNCED_FPS}
          durationInFrames={BEAT_SYNCED_DURATION_FRAMES}
          defaultProps={{
            photoUrls: PLACEHOLDER_PHOTOS.slice(0, 4),
            brandName: "Frame & Form Realty",
            brandLogoUrl: "",
            website: "frameandformstudio.com",
            seed: 42 + i * 17,
            styleOverride: styleKey,
          }}
        />
      ))}
      <Composition
        id="GridCollageReel"
        component={GridCollageReel}
        schema={gridCollageReelSchema}
        width={W}
        height={H}
        fps={GRID_COLLAGE_FPS}
        durationInFrames={GRID_COLLAGE_DURATION_FRAMES}
        defaultProps={{
          photoUrls: PLACEHOLDER_PHOTOS.slice(0, 4),
          brandName: "Frame & Form Realty",
          brandLogoUrl: "",
          website: "frameandformstudio.com",
          seed: 42,
        }}
      />
      <Composition
        id="CinematicPanReel"
        component={CinematicPanReel}
        schema={cinematicPanReelSchema}
        width={W}
        height={H}
        fps={CINEMATIC_PAN_FPS}
        durationInFrames={CINEMATIC_PAN_DURATION_FRAMES}
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
      {/* ---- Animated Quick Post (square + story) ---- */}
      {(
        [
          { id: "AnimatedQuickPost", width: 1080, height: 1080 },
          { id: "AnimatedQuickPost-Story", width: 1080, height: 1920 },
        ] as const
      ).map((v) => (
        <Composition
          key={v.id}
          id={v.id}
          component={AnimatedQuickPost}
          schema={animatedQuickPostSchema}
          width={v.width}
          height={v.height}
          fps={ANIMATED_QUICK_POST_FPS}
          durationInFrames={ANIMATED_QUICK_POST_DURATION_FRAMES}
          defaultProps={{
            photoUrl: PLACEHOLDER_PHOTOS[0],
            eyebrow: "Now Leasing",
            headline: "Brand-new pool homes in Cape Coral",
            area: "Cape Coral, FL",
            specsLine: "$525,000 · 2,140 Sqft · Private Pool",
            featuresLine: "Cathedral ceilings · 42″ cabinets · Screened lanai",
            cta: "DM to schedule a tour",
            brandName: "Frame & Form Studio",
            logoUrl: null,
            primaryColor: "#3d4a2f",
            secondaryColor: "#c29870",
            seed: 42,
          }}
        />
      ))}
    </>
  );
};
