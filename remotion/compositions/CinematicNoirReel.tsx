/**
 * CinematicNoirReel — dark, film-graded listing trailer.
 *
 * Opens on the hero photo with the address in serif under a "Now available"
 * label in the agent's color. Three graded scenes follow, crossfading with
 * a warm light-leak sweep, each with a numbered label and one of the reel's
 * phrases. The price counts up on a dark card with a glow in the agent's
 * color, then a closing card: headshot, name, brokerage, phone, over a
 * blurred, darkened hero photo. Vignette + soft grain throughout.
 *
 * Schema-compatible with SimpleShowcaseReel (same server props).
 * 15s @ 9:16, 450 frames @ 30fps.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { SfxAt } from "../components/Sfx";
import { FONT_FAMILY, SERIF_FAMILY } from "../lib/fonts";
import { descriptivePhrases, highlightColor, reelExtrasShape, withAlpha } from "../lib/brand";

export const CINEMATIC_NOIR_FPS = 30;
export const CINEMATIC_NOIR_DURATION_FRAMES = 450;

const XF = 12; // crossfade frames
const SCENES = [
  { from: 0, len: 96 },
  { from: 84, len: 84 },
  { from: 156, len: 84 },
  { from: 228, len: 84 },
];
const PRICE = { from: 300, len: 72 };
const END = { from: 360, len: 90 };

const GRADE = "brightness(0.66) contrast(1.08) saturate(0.86) sepia(0.08)";

export const cinematicNoirReelSchema = z.object({
  photoUrls: z.array(z.string()).length(4),
  brandName: z.string(),
  brandLogoUrl: z.string(),
  website: z.string().nullable(),
  seed: z.number(),
  ...reelExtrasShape,
});

export type CinematicNoirReelProps = z.infer<typeof cinematicNoirReelSchema>;

const ease = Easing.bezier(0.22, 1, 0.36, 1);

function fadeUp(frame: number, start: number, dur = 18, dist = 24) {
  const t = interpolate(frame - start, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return { opacity: t, transform: `translateY(${dist * (1 - t)}px)` };
}

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)," +
        "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.78) 100%)",
    }}
  />
);

const Grain: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const ox = Math.floor(random(`ng-x-${seed}-${frame}`) * 180);
  const oy = Math.floor(random(`ng-y-${seed}-${frame}`) * 180);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.08,
        mixBlendMode: "overlay",
        backgroundImage:
          "radial-gradient(circle at 20% 30%, white 0.6px, transparent 1.2px)," +
          "radial-gradient(circle at 70% 60%, white 0.6px, transparent 1.2px)",
        backgroundSize: "29px 31px, 43px 37px",
        backgroundPosition: `${ox}px ${oy}px, ${-oy}px ${ox}px`,
      }}
    />
  );
};

/** Warm light-leak that sweeps across a cut. Local frame 0 = cut start. */
const LightLeak: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 18;
  const a = Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 0.55;
  const x = -40 + 180 * t;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: a,
        background: `radial-gradient(ellipse 38% 70% at ${x}% 50%, rgba(255,170,90,0.95), rgba(255,120,60,0.35) 45%, rgba(0,0,0,0) 75%)`,
      }}
    />
  );
};

const PhotoScene: React.FC<{
  src: string;
  seed: number;
  index: number;
  len: number;
  fadeIn: boolean;
  children?: React.ReactNode;
}> = ({ src, seed, index, len, fadeIn, children }) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn
    ? interpolate(frame, [0, XF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  return (
    <AbsoluteFill style={{ opacity }}>
      <KenBurnsImage src={src} durationInFrames={len + XF} seed={seed} slideIndex={index} filter={GRADE} />
      <Vignette />
      {children}
    </AbsoluteFill>
  );
};

const Label: React.FC<{ text: string; color: string; style?: React.CSSProperties }> = ({ text, color, style }) => (
  <div
    style={{
      fontFamily: FONT_FAMILY,
      fontWeight: 700,
      fontSize: 28,
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {text}
  </div>
);

function formatCount(target: string, t: number): string {
  const digits = target.replace(/[^0-9]/g, "");
  if (!digits) return target;
  const value = Math.round(Number(digits) * t);
  const prefix = target.trim().startsWith("$") ? "$" : "";
  return prefix + value.toLocaleString("en-US");
}

export const CinematicNoirReel: React.FC<CinematicNoirReelProps> = (props) => {
  const { photoUrls, seed, brandName } = props;
  const accent = highlightColor(props);
  const titles = descriptivePhrases(props.overlayPhrases, props.agentName);
  const fallback = [(props.stats ?? []).join(" · "), props.cityLine ?? "", props.address ?? ""];

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0d" }}>
      <BackgroundMusic seed={seed} mood="elegant" volume={0.65} />

      {/* Scene 0: hero + address */}
      <Sequence from={SCENES[0].from} durationInFrames={SCENES[0].len + XF}>
        <PhotoScene src={photoUrls[0]} seed={seed} index={0} len={SCENES[0].len} fadeIn={false}>
          <HeroTitle accent={accent} address={props.address ?? ""} cityLine={props.cityLine ?? ""} brandName={brandName} />
        </PhotoScene>
      </Sequence>

      {/* Scenes 1–3 */}
      {[1, 2, 3].map((i) => {
        const s = SCENES[i];
        const title = titles[i - 1] ?? fallback[i - 1] ?? "";
        return (
          <Sequence key={i} from={s.from} durationInFrames={s.len + XF}>
            <PhotoScene src={photoUrls[i]} seed={seed} index={i} len={s.len} fadeIn>
              <SceneTitle index={i} title={title} accent={accent} />
            </PhotoScene>
            <LightLeak />
          </Sequence>
        );
      })}

      {/* Price */}
      <Sequence from={PRICE.from} durationInFrames={PRICE.len + XF}>
        <PriceCard price={props.priceLabel ?? ""} stats={props.stats ?? []} accent={accent} />
        <LightLeak />
      </Sequence>

      {/* Agent card */}
      <Sequence from={END.from} durationInFrames={END.len}>
        <AgentCard
          photo={photoUrls[0]}
          accent={accent}
          agentName={props.agentName ?? ""}
          brandName={brandName}
          phone={props.phone ?? ""}
          headshot={props.agentHeadshotUrl ?? ""}
          logo={props.brandLogoUrl}
        />
      </Sequence>

      <Grain seed={seed} />

      {props.sfx !== false && (
        <>
          {[1, 2, 3].map((i) => (
            <SfxAt key={i} name="swish-soft" at={SCENES[i].from + XF / 2} volume={0.3} />
          ))}
          <SfxAt name="whoosh-2" at={PRICE.from + 6} volume={0.28} />
          <SfxAt name="impact" at={PRICE.from + 30} volume={0.42} />
          <SfxAt name="chime" at={END.from + 18} volume={0.26} />
        </>
      )}
    </AbsoluteFill>
  );
};

const HeroTitle: React.FC<{ accent: string; address: string; cityLine: string; brandName: string }> = ({
  accent,
  address,
  cityLine,
  brandName,
}) => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [SCENES[0].len - 10, SCENES[0].len + 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 80px", opacity: exit }}>
      <div style={{ marginTop: -60 }}>
        <Label text="Now available" color={accent} style={fadeUp(frame, 10)} />
        <div
          style={{
            fontFamily: SERIF_FAMILY,
            fontWeight: 600,
            fontSize: 104,
            lineHeight: 1.02,
            color: "#F6F4EE",
            marginTop: 26,
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
            ...fadeUp(frame, 20, 22, 30),
          }}
        >
          {address}
        </div>
        {cityLine ? (
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 36, color: "rgba(246,244,238,0.82)", marginTop: 22, ...fadeUp(frame, 32) }}>
            {cityLine}
          </div>
        ) : null}
        <div style={{ width: 180, height: 3, background: accent, margin: "40px auto 0", ...fadeUp(frame, 40, 16, 0) }} />
        {brandName ? (
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 26, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(246,244,238,0.7)", marginTop: 28, ...fadeUp(frame, 46) }}>
            {brandName}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const SceneTitle: React.FC<{ index: number; title: string; accent: string }> = ({ index, title, accent }) => {
  const frame = useCurrentFrame();
  const long = title.length > 30;
  return (
    <div style={{ position: "absolute", left: 84, right: 84, top: 1060 }}>
      <Label text={`0${index} / 03`} color={accent} style={fadeUp(frame, XF + 2)} />
      <div
        style={{
          fontFamily: SERIF_FAMILY,
          fontWeight: 600,
          fontSize: long ? 70 : 86,
          lineHeight: 1.04,
          color: "#F6F4EE",
          marginTop: 20,
          textShadow: "0 4px 26px rgba(0,0,0,0.55)",
          ...fadeUp(frame, XF + 8, 20, 26),
        }}
      >
        {title}
      </div>
      <div style={{ width: 140, height: 3, background: accent, marginTop: 30, ...fadeUp(frame, XF + 16, 14, 0) }} />
    </div>
  );
};

const PriceCard: React.FC<{ price: string; stats: string[]; accent: string }> = ({ price, stats, accent }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, XF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = interpolate(frame, [8, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const landed = frame >= 32;
  const pulse = landed ? 1 + 0.05 * Math.exp(-(frame - 32) / 5) : 1;
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at 50% 46%, ${withAlpha(accent, 0.28)}, rgba(11,11,13,1) 70%)`,
          backgroundColor: "#0b0b0d",
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={{ marginTop: -80 }}>
          <Label text="Offered at" color="rgba(246,244,238,0.72)" style={fadeUp(frame, 4)} />
          <div
            style={{
              fontFamily: SERIF_FAMILY,
              fontWeight: 700,
              fontSize: 170,
              lineHeight: 1,
              marginTop: 24,
              color: landed ? accent : "#F6F4EE",
              transform: `scale(${pulse})`,
              textShadow: landed ? `0 0 60px ${withAlpha(accent, 0.55)}` : "none",
              fontVariantNumeric: "lining-nums",
            }}
          >
            {price ? formatCount(price, t) : ""}
          </div>
          {stats.length > 0 ? (
            <div style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 38, letterSpacing: "0.12em", color: "#F6F4EE", marginTop: 34, ...fadeUp(frame, 36) }}>
              {stats.join("  ·  ").toUpperCase()}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const AgentCard: React.FC<{
  photo: string;
  accent: string;
  agentName: string;
  brandName: string;
  phone: string;
  headshot: string;
  logo: string;
}> = ({ photo, accent, agentName, brandName, phone, headshot, logo }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, XF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={photo}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(28px) brightness(0.32) saturate(0.7)", transform: "scale(1.12)" }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 80px" }}>
        <div style={{ marginTop: -120, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {headshot ? (
            <Img
              src={headshot}
              style={{ width: 230, height: 230, borderRadius: "50%", objectFit: "cover", border: `5px solid ${accent}`, ...fadeUp(frame, 8) }}
            />
          ) : null}
          <div style={{ fontFamily: SERIF_FAMILY, fontWeight: 600, fontSize: 92, color: "#F6F4EE", marginTop: 34, lineHeight: 1, ...fadeUp(frame, 14) }}>
            {agentName || brandName}
          </div>
          {agentName && brandName ? (
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 30, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(246,244,238,0.75)", marginTop: 22, ...fadeUp(frame, 20) }}>
              {brandName}
            </div>
          ) : null}
          <div style={{ width: 160, height: 3, background: accent, marginTop: 36, ...fadeUp(frame, 24, 14, 0) }} />
          {phone ? (
            <div style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 54, color: accent, marginTop: 34, ...fadeUp(frame, 28) }}>
              {phone}
            </div>
          ) : null}
          <Label text="Schedule a private showing" color="rgba(246,244,238,0.7)" style={{ marginTop: 26, ...fadeUp(frame, 34) }} />
          {logo ? <Img src={logo} style={{ height: 84, width: "auto", objectFit: "contain", marginTop: 46, ...fadeUp(frame, 40) }} /> : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
