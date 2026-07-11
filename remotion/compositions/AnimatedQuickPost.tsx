/**
 * AnimatedQuickPost — the Quick Post design, in motion.
 *
 * Not a property video: it's the branded GRAPHIC animating. The photo
 * drifts (Ken Burns), the eyebrow fades in, the headline springs up,
 * specs stagger in, and the CTA pill pops near the end. 6 seconds,
 * silent (feeds autoplay muted), square and story variants.
 *
 * Registered twice in Root.tsx: "AnimatedQuickPost" (1080×1080) and
 * "AnimatedQuickPost-Story" (1080×1920) — same component, dimensions
 * come from useVideoConfig().
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { loadInterFonts, FONT_FAMILY } from "../lib/fonts";
import { Watermark } from "../components/Watermark";

export const ANIMATED_QUICK_POST_FPS = 30;
export const ANIMATED_QUICK_POST_DURATION_FRAMES = 180; // 6s

export const animatedQuickPostSchema = z.object({
  photoUrl: z.string(),
  eyebrow: z.string(), // e.g. "NOW LEASING"
  headline: z.string(),
  area: z.string().nullable(),
  specsLine: z.string().nullable(), // "$525,000 · 2,140 Sqft · Private Pool"
  featuresLine: z.string().nullable(), // "Cathedral ceilings · 42″ cabinets"
  cta: z.string().nullable(),
  brandName: z.string(),
  logoUrl: z.string().nullable(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  seed: z.number(),
});

export type AnimatedQuickPostProps = z.infer<typeof animatedQuickPostSchema>;

export const AnimatedQuickPost: React.FC<AnimatedQuickPostProps> = ({
  photoUrl,
  eyebrow,
  headline,
  area,
  specsLine,
  featuresLine,
  cta,
  brandName,
  logoUrl,
  primaryColor,
  secondaryColor,
  seed,
}) => {
  loadInterFonts();
  const frame = useCurrentFrame();
  const { fps, height, durationInFrames } = useVideoConfig();
  const isStory = height > 1200;
  const s = (base: number) => (isStory ? base * 1.12 : base);

  // --- Photo: slow Ken Burns drift, direction seeded ------------------------
  const dirX = random(`qp-x-${seed}`) > 0.5 ? 1 : -1;
  const dirY = random(`qp-y-${seed}`) > 0.5 ? 1 : -1;
  const zoom = interpolate(frame, [0, durationInFrames], [1.06, 1.18]);
  const panX = interpolate(frame, [0, durationInFrames], [0, dirX * 22]);
  const panY = interpolate(frame, [0, durationInFrames], [0, dirY * 14]);

  // --- Entrances -------------------------------------------------------------
  const scrimIn = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });
  const brandIn = interpolate(frame, [8, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eyebrowIn = interpolate(frame, [18, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headlineSpring = spring({ frame: frame - 28, fps, config: { damping: 16, mass: 0.9 } });
  const areaIn = interpolate(frame, [48, 64], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const specsIn = interpolate(frame, [58, 76], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const featuresIn = interpolate(frame, [70, 88], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaSpring = spring({ frame: frame - 100, fps, config: { damping: 11, mass: 0.7 } });

  return (
    <AbsoluteFill style={{ backgroundColor: "#111", fontFamily: FONT_FAMILY }}>
      {/* Photo with Ken Burns */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={photoUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
          }}
        />
      </AbsoluteFill>

      {/* Scrim */}
      <AbsoluteFill
        style={{
          opacity: scrimIn,
          background:
            "linear-gradient(to top, rgba(12,14,10,0.88) 0%, rgba(12,14,10,0.45) 38%, rgba(12,14,10,0.05) 65%, rgba(12,14,10,0.25) 100%)",
        }}
      />

      {/* Brand row (top-left) */}
      <div
        style={{
          position: "absolute",
          top: s(44),
          left: s(48),
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: brandIn,
        }}
      >
        {logoUrl ? (
          <Img
            src={logoUrl}
            style={{
              height: s(56),
              width: s(56),
              borderRadius: "50%",
              objectFit: "cover",
              backgroundColor: "rgba(255,255,255,0.92)",
            }}
          />
        ) : null}
        <div
          style={{
            color: "rgba(255,255,255,0.92)",
            fontSize: s(26),
            fontWeight: 700,
            letterSpacing: "0.02em",
            textShadow: "0 1px 10px rgba(0,0,0,0.4)",
          }}
        >
          {brandName}
        </div>
      </div>

      {/* Text block (bottom) */}
      <div
        style={{
          position: "absolute",
          left: s(48),
          right: s(48),
          bottom: s(56),
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: eyebrowIn,
            marginBottom: s(18),
          }}
        >
          <div style={{ width: s(46), height: 3, backgroundColor: secondaryColor }} />
          <div
            style={{
              color: secondaryColor,
              fontSize: s(24),
              fontWeight: 700,
              letterSpacing: `${0.34 - eyebrowIn * 0.1}em`,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            color: "white",
            fontSize: s(72),
            lineHeight: 1.08,
            fontWeight: 700,
            maxWidth: "94%",
            opacity: Math.min(1, headlineSpring * 1.2),
            transform: `translateY(${(1 - headlineSpring) * 60}px)`,
            textShadow: "0 2px 24px rgba(0,0,0,0.45)",
          }}
        >
          {headline}
        </div>

        {/* Area */}
        {area ? (
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: s(30),
              marginTop: s(12),
              opacity: areaIn,
            }}
          >
            {area}
          </div>
        ) : null}

        {/* Specs */}
        {specsLine ? (
          <div
            style={{
              color: "rgba(255,255,255,0.95)",
              fontSize: s(28),
              fontWeight: 700,
              marginTop: s(20),
              opacity: specsIn,
              transform: `translateY(${(1 - specsIn) * 18}px)`,
            }}
          >
            {specsLine}
          </div>
        ) : null}

        {/* Features */}
        {featuresLine ? (
          <div
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: s(23),
              marginTop: s(10),
              opacity: featuresIn,
              transform: `translateY(${(1 - featuresIn) * 14}px)`,
            }}
          >
            {featuresLine}
          </div>
        ) : null}

        {/* CTA pill */}
        {cta ? (
          <div style={{ display: "flex", marginTop: s(28) }}>
            <div
              style={{
                backgroundColor: primaryColor,
                color: "white",
                fontSize: s(26),
                fontWeight: 700,
                padding: `${s(14)}px ${s(34)}px`,
                borderRadius: 999,
                opacity: Math.min(1, ctaSpring * 1.3),
                transform: `scale(${0.6 + ctaSpring * 0.4})`,
                transformOrigin: "left center",
                boxShadow: "0 6px 30px rgba(0,0,0,0.35)",
              }}
            >
              {cta}
            </div>
          </div>
        ) : null}
      </div>

      {/* Free-tier watermark (driven by top-level `watermark` input prop) */}
      <Watermark />
    </AbsoluteFill>
  );
};
