/**
 * JustListedReel — Remotion replacement for the Creatomate
 * "day1_just_listed" template (9b317da0). The Day 1 hero piece.
 *
 * Spec parity: 5 photos, "Just Listed" hero + address, two stat panels,
 * agent outro. 30s @ 9:16.
 * Timing: 900 frames @ 30fps. Five 192-frame slides, four 15-frame
 * seeded transitions (5×192 − 4×15 = 900).
 *
 * Narrative: hero label + address over photo 1 → stats panel 1 over
 * photo 2 → stats panel 2 over photo 3 → clean breather on photo 4 →
 * agent outro card over photo 5.
 *
 * Brand pass: "Just Listed" builds word by word in the agent's color with
 * a low impact hit, stat panels and the outro wear the same color, the
 * breather slide carries one of the reel's phrases, and each cut gets a
 * whoosh; a chime marks the agent card.
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { z } from "zod";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { TextOverlay } from "../components/TextOverlay";
import { DetailsPanel } from "../components/DetailsPanel";
import { AgentOutro } from "../components/AgentOutro";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { pickTransition } from "../lib/transitions";
import { textEnterFrameFor } from "../lib/seeded";
import { KineticCaption } from "../components/KineticCaption";
import { CutSfx, SfxAt } from "../components/Sfx";
import { highlightColor, reelExtrasShape } from "../lib/brand";

export const JUST_LISTED_FPS = 30;
export const JUST_LISTED_DURATION_FRAMES = 900; // 30s
const SLIDE_FRAMES = 192;
const TRANSITION_FRAMES = 15;
/** Global start frame of slide N (0-indexed), accounting for overlaps. */
const slideStart = (n: number): number =>
  n * (SLIDE_FRAMES - TRANSITION_FRAMES);

export const justListedReelSchema = z.object({
  heroLabel: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string(),
  details1: z.array(z.string()),
  details2: z.array(z.string()),
  photoUrls: z.array(z.string()).length(5),
  agentName: z.string(),
  brandName: z.string(),
  phone: z.string(),
  email: z.string(),
  agentHeadshotUrl: z.string(),
  seed: z.number(),
  primaryColor: reelExtrasShape.primaryColor,
  secondaryColor: reelExtrasShape.secondaryColor,
  accentColor: reelExtrasShape.accentColor,
  overlayPhrases: reelExtrasShape.overlayPhrases,
  sfx: reelExtrasShape.sfx,
});

export type JustListedReelProps = z.infer<typeof justListedReelSchema>;

export const JustListedReel: React.FC<JustListedReelProps> = (props) => {
  const {
    heroLabel,
    addressLine1,
    addressLine2,
    details1,
    details2,
    photoUrls,
    agentName,
    brandName,
    phone,
    email,
    agentHeadshotUrl,
    seed,
  } = props;
  const heroEnter = textEnterFrameFor(seed, "hero", 12, 30);
  const highlight = highlightColor(props);
  // The breather slide gets a descriptive phrase (stats already have panels).
  const breatherPhrase =
    (props.overlayPhrases ?? []).find((p) => p.trim() && !/[0-9$]/.test(p)) ?? null;
  const cuts = [1, 2, 3, 4].map((n) => slideStart(n) + Math.round(TRANSITION_FRAMES / 2));

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <BackgroundMusic seed={seed} />
      <TransitionSeries>
        {photoUrls.map((url, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={SLIDE_FRAMES}>
              <KenBurnsImage
                src={url}
                durationInFrames={SLIDE_FRAMES}
                seed={seed}
                slideIndex={i}
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

      {/* Slide 1: hero label + address */}
      <Sequence durationInFrames={slideStart(1) + TRANSITION_FRAMES} layout="none">
        <Sequence from={heroEnter} durationInFrames={slideStart(1) + TRANSITION_FRAMES - heroEnter} layout="none">
          <KineticCaption
            text={heroLabel}
            durationInFrames={slideStart(1) + TRANSITION_FRAMES - heroEnter}
            highlight={highlight}
            y={0.44}
            stagger={5}
          />
        </Sequence>
        <TextOverlay
          text={`${addressLine1}, ${addressLine2}`}
          enterFrame={heroEnter + 12}
          position="bottom"
          fontSize={48}
        />
      </Sequence>

      {/* Slide 2: first stats panel */}
      <Sequence
        from={slideStart(1)}
        durationInFrames={SLIDE_FRAMES}
        layout="none"
      >
        <DetailsPanel
          lines={details1}
          enterFrame={textEnterFrameFor(seed, "details1", 18, 40)}
          accent={highlight}
        />
      </Sequence>

      {/* Slide 3: second stats panel */}
      <Sequence
        from={slideStart(2)}
        durationInFrames={SLIDE_FRAMES}
        layout="none"
      >
        <DetailsPanel
          lines={details2}
          enterFrame={textEnterFrameFor(seed, "details2", 18, 40)}
          accent={highlight}
        />
      </Sequence>

      {/* Slide 4: breather with one descriptive phrase */}
      {breatherPhrase ? (
        <Sequence
          from={slideStart(3) + TRANSITION_FRAMES + 10}
          durationInFrames={SLIDE_FRAMES - TRANSITION_FRAMES * 2 - 10}
          layout="none"
        >
          <KineticCaption
            text={breatherPhrase}
            durationInFrames={SLIDE_FRAMES - TRANSITION_FRAMES * 2 - 10}
            highlight={highlight}
          />
        </Sequence>
      ) : null}

      {/* Slide 5: agent outro */}
      <Sequence from={slideStart(4)} layout="none">
        <AgentOutro
          agentName={agentName}
          brandName={brandName}
          phone={phone}
          email={email}
          headshotUrl={agentHeadshotUrl}
          enterFrame={20}
          accent={highlight}
        />
      </Sequence>

      {props.sfx !== false && (
        <>
          <SfxAt name="impact" at={heroEnter + 4} volume={0.45} />
          <CutSfx cuts={cuts} volume={0.32} />
          <SfxAt name="chime" at={slideStart(4) + 22} volume={0.3} />
        </>
      )}
    </AbsoluteFill>
  );
};
