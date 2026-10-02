/**
 * EditorialCountdownReel — magazine-style reel on warm paper.
 *
 * Hook: "Just Listed · City", the address in serif and the price in the
 * agent's color, with the hero photo landing as a framed print. Then three
 * numbered beats (01–03): a big serif numeral, one of the reel's phrases and
 * a framed print sliding in from alternating sides while the photo inside
 * drifts. Story-style progress bars track the countdown. Ends on a solid
 * card in the agent's color with name, brokerage and phone.
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
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { KenBurnsImage } from "../components/KenBurnsImage";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { SfxAt } from "../components/Sfx";
import { FONT_FAMILY, SERIF_FAMILY } from "../lib/fonts";
import {
  descriptivePhrases,
  highlightColor,
  reelExtrasShape,
  solidColor,
  textOn,
  withAlpha,
} from "../lib/brand";

export const EDITORIAL_FPS = 30;
export const EDITORIAL_DURATION_FRAMES = 450;

const PAPER = "#F1EBDE";
const INK = "#1F2A22";
const MUTED = "#6B6A5E";

const HOOK = { from: 0, len: 90 };
const ITEMS = [
  { from: 90, len: 94 },
  { from: 184, len: 94 },
  { from: 278, len: 94 },
];
const END = { from: 372, len: 78 };

export const editorialCountdownReelSchema = z.object({
  photoUrls: z.array(z.string()).length(4),
  brandName: z.string(),
  brandLogoUrl: z.string(),
  website: z.string().nullable(),
  seed: z.number(),
  ...reelExtrasShape,
});

export type EditorialCountdownReelProps = z.infer<typeof editorialCountdownReelSchema>;

const ease = Easing.bezier(0.22, 1, 0.36, 1);

function rise(frame: number, start: number, dur = 16, dist = 28) {
  const t = interpolate(frame - start, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return { opacity: t, transform: `translateY(${dist * (1 - t)}px)` };
}

/** Subtle paper texture: two soft radial washes. */
const Paper: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: PAPER,
      backgroundImage:
        "radial-gradient(circle at 18% 12%, rgba(255,255,255,0.55), transparent 45%)," +
        "radial-gradient(circle at 85% 90%, rgba(120,100,60,0.10), transparent 50%)",
    }}
  />
);

/** A framed print that slides in from one side, tilts and settles. */
const Print: React.FC<{
  src: string;
  seed: number;
  index: number;
  durationInFrames: number;
  fromRight: boolean;
  width: number;
  height: number;
  top: number;
  settleRotation: number;
}> = ({ src, seed, index, durationInFrames, fromRight, width, height, top, settleRotation }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 90, mass: 0.9 } });
  const dx = (fromRight ? 1 : -1) * 1150 * (1 - s);
  const rot = settleRotation + (fromRight ? 8 : -8) * (1 - s);
  const bob = Math.sin(frame / 22) * 4;
  const border = 22;
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - width - border * 2) / 2,
        top: top + bob,
        width: width + border * 2,
        height: height + border * 2,
        background: "#FCFAF4",
        padding: border,
        transform: `translateX(${dx}px) rotate(${rot}deg)`,
        boxShadow: "0 30px 60px rgba(40,34,20,0.28), 0 6px 14px rgba(40,34,20,0.18)",
      }}
    >
      <div style={{ position: "relative", width, height, overflow: "hidden" }}>
        <KenBurnsImage src={src} durationInFrames={durationInFrames} seed={seed} slideIndex={index} />
      </div>
    </div>
  );
};

const ProgressBars: React.FC<{ active: number; color: string; localFrame: number; len: number }> = ({
  active,
  color,
  localFrame,
  len,
}) => {
  const segW = 290;
  const gap = 16;
  return (
    <div style={{ position: "absolute", left: 84, top: 262, display: "flex", gap }}>
      {[0, 1, 2].map((i) => {
        const fill = i < active ? 1 : i === active ? Math.min(1, localFrame / (len * 0.9)) : 0;
        return (
          <div key={i} style={{ width: segW, height: 8, borderRadius: 4, background: "rgba(31,42,34,0.14)" }}>
            <div style={{ width: segW * fill, height: 8, borderRadius: 4, background: color }} />
          </div>
        );
      })}
    </div>
  );
};

const Header: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <div
    style={{
      position: "absolute",
      left: 84,
      top: 200,
      fontFamily: FONT_FAMILY,
      fontWeight: 700,
      fontSize: 30,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color,
    }}
  >
    {text}
  </div>
);

const HookScene: React.FC<{
  photo: string;
  seed: number;
  header: string;
  address: string;
  price: string;
  cityLine: string;
  solid: string;
  accent: string;
}> = ({ photo, seed, header, address, price, cityLine, solid, accent }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Paper />
      <Header text={header} color={solid} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 290, ...rise(frame, 6) }}>
        <div style={{ fontFamily: SERIF_FAMILY, fontWeight: 600, fontSize: 96, lineHeight: 1.0, color: INK }}>
          {address}
        </div>
        {cityLine ? (
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 34, color: MUTED, marginTop: 14 }}>{cityLine}</div>
        ) : null}
      </div>
      {price ? (
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 545,
            fontFamily: SERIF_FAMILY,
            fontWeight: 700,
            fontSize: 112,
            color: accent,
            ...rise(frame, 22),
          }}
        >
          {price}
        </div>
      ) : null}
      <Sequence from={14} layout="none">
        <Print
          src={photo}
          seed={seed}
          index={0}
          durationInFrames={HOOK.len}
          fromRight={false}
          width={880}
          height={720}
          top={760}
          settleRotation={1.4}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

const ItemScene: React.FC<{
  photo: string;
  seed: number;
  index: number;
  title: string;
  header: string;
  solid: string;
}> = ({ photo, seed, index, title, header, solid }) => {
  const frame = useCurrentFrame();
  const len = ITEMS[index].len;
  const long = title.length > 34;
  return (
    <AbsoluteFill>
      <Paper />
      <Header text={header} color={solid} />
      <ProgressBars active={index} color={solid} localFrame={frame} len={len} />
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 300,
          fontFamily: SERIF_FAMILY,
          fontWeight: 600,
          fontSize: 210,
          lineHeight: 1,
          color: solid,
          ...rise(frame, 4, 14, 34),
        }}
      >
        {`0${index + 1}`}
      </div>
      <div
        style={{
          position: "absolute",
          left: 84,
          right: 84,
          top: 530,
          fontFamily: SERIF_FAMILY,
          fontWeight: 600,
          fontSize: long ? 62 : 76,
          lineHeight: 1.06,
          color: INK,
          ...rise(frame, 12, 16, 22),
        }}
      >
        {title}
      </div>
      <Print
        src={photo}
        seed={seed}
        index={index + 1}
        durationInFrames={len}
        fromRight={index % 2 === 0}
        width={800}
        height={960}
        top={long ? 745 : 720}
        settleRotation={index % 2 === 0 ? -1.8 : 1.8}
      />
    </AbsoluteFill>
  );
};

const EndScene: React.FC<{
  solid: string;
  accent: string;
  agentName: string;
  brandName: string;
  phone: string;
  address: string;
  headshot: string;
  logo: string;
  cta?: string;
}> = ({ solid, accent, agentName, brandName, phone, address, headshot, logo, cta }) => {
  const frame = useCurrentFrame();
  const fg = textOn(solid);
  const wipe = interpolate(frame, [0, 14], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <AbsoluteFill style={{ clipPath: `inset(${100 - wipe}% 0 0 0)` }}>
      <AbsoluteFill style={{ backgroundColor: solid }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          flexDirection: "column",
          padding: "0 90px 180px",
          color: fg,
        }}
      >
        <div style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 30, letterSpacing: "0.22em", textTransform: "uppercase", color: accent, ...rise(frame, 10) }}>
          {cta ?? "Book a showing"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: 30, ...rise(frame, 16) }}>
          {headshot ? (
            <Img
              src={headshot}
              style={{ width: 170, height: 170, borderRadius: "50%", objectFit: "cover", border: `5px solid ${accent}` }}
            />
          ) : null}
          <div style={{ fontFamily: SERIF_FAMILY, fontWeight: 600, fontSize: 96, lineHeight: 1 }}>{agentName || brandName}</div>
        </div>
        {agentName && brandName ? (
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 38, marginTop: 26, ...rise(frame, 22), color: withAlpha(fg, 0.85) }}>{brandName}</div>
        ) : null}
        {phone ? (
          <div style={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 56, marginTop: 40, color: accent, ...rise(frame, 28) }}>
            {phone}
          </div>
        ) : null}
        <div style={{ width: 200, height: 4, background: withAlpha(fg, 0.5), marginTop: 46, ...rise(frame, 32) }} />
        {address ? (
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 32, marginTop: 30, ...rise(frame, 36), color: withAlpha(fg, 0.8) }}>{address}</div>
        ) : null}
        {logo ? (
          <Img src={logo} style={{ height: 90, width: "auto", marginTop: 50, objectFit: "contain", ...rise(frame, 40) }} />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const EditorialCountdownReel: React.FC<EditorialCountdownReelProps> = (props) => {
  const { photoUrls, seed, brandName, brandLogoUrl } = props;
  const accent = highlightColor(props);
  const solid = solidColor(props);
  const city = (props.cityLine ?? "").split(",")[0].trim();
  const hero = props.heroLabel ?? "Just listed";
  const header = city ? `${hero} · ${city}` : hero;
  const fallback = [
    (props.stats ?? []).join(" · ") || props.priceLabel || "",
    props.priceLabel || props.cityLine || "",
    props.cityLine || props.address || "",
  ];
  const described = descriptivePhrases(props.overlayPhrases, props.agentName);
  const titles = [0, 1, 2].map((i) => described[i] ?? fallback[i] ?? "");

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <BackgroundMusic seed={seed} mood="chill" volume={0.6} />

      <Sequence from={HOOK.from} durationInFrames={HOOK.len}>
        <HookScene
          photo={photoUrls[0]}
          seed={seed}
          header={header}
          address={props.address ?? ""}
          price={props.priceLabel ?? ""}
          cityLine={props.cityLine ?? ""}
          solid={solid}
          accent={accent}
        />
      </Sequence>

      {ITEMS.map((it, i) => (
        <Sequence key={i} from={it.from} durationInFrames={it.len}>
          <ItemScene photo={photoUrls[i + 1]} seed={seed} index={i} title={titles[i]} header={header} solid={solid} />
        </Sequence>
      ))}

      <Sequence from={END.from} durationInFrames={END.len}>
        <EndScene
          solid={solid}
          accent={accent}
          agentName={props.agentName ?? ""}
          brandName={brandName}
          phone={props.phone ?? ""}
          address={[props.address, props.cityLine].filter(Boolean).join(", ")}
          headshot={props.agentHeadshotUrl ?? ""}
          logo={brandLogoUrl}
          cta={props.ctaLine}
        />
      </Sequence>

      {props.sfx !== false && (
        <>
          <SfxAt name="swish-soft" at={HOOK.from + 26} volume={0.3} />
          {ITEMS.map((it, i) => (
            <SfxAt key={i} name="swish-soft" at={it.from + 12} volume={0.3} />
          ))}
          <SfxAt name="whoosh-1" at={END.from + 8} volume={0.3} />
          <SfxAt name="chime" at={END.from + 20} volume={0.28} />
        </>
      )}
    </AbsoluteFill>
  );
};
