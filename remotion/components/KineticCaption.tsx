/**
 * KineticCaption — on-screen phrase that builds word by word.
 *
 * "pop": bold uppercase words spring in one after another (scale + lift),
 * numbers / prices / the closing word light up in the agent's brand color.
 * "rise": quieter sentence-case line that fades up word by word, for the
 * calmer styles.
 *
 * Mount inside a <Sequence>; frame 0 is when the first word starts. The
 * caption fades out over its last few frames. A soft scrim sits behind the
 * text so it reads on bright photos without a hard box.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "../lib/fonts";

type KineticCaptionProps = {
  text: string;
  /** Frames the caption is on screen (its Sequence duration). */
  durationInFrames: number;
  highlight: string;
  variant?: "pop" | "rise";
  /** Vertical center of the text block, as a fraction of frame height. */
  y?: number;
  /** Frames between words. */
  stagger?: number;
};

const EXIT_FRAMES = 7;
const OUTLINE =
  "0 0 2px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.85), 0 3px 10px rgba(0,0,0,0.55), 0 8px 30px rgba(0,0,0,0.45)";

function isKeyWord(word: string): boolean {
  return /[0-9$]/.test(word);
}

export const KineticCaption: React.FC<KineticCaptionProps> = ({
  text,
  durationInFrames,
  highlight,
  variant = "pop",
  y = 0.56,
  stagger,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length === 0) return null;

  const anyKey = words.some(isKeyWord);
  const keyIndex = (i: number) => (anyKey ? isKeyWord(words[i]) : i === words.length - 1);

  const pop = variant === "pop";
  const step = stagger ?? (pop ? 3 : 4);
  const longest = Math.max(...words.map((w) => w.length));
  const fontSize = pop
    ? words.length <= 3 && longest <= 9
      ? 104
      : words.length <= 5
        ? 88
        : 74
    : words.length <= 4
      ? 76
      : 64;

  const exit = interpolate(
    frame,
    [durationInFrames - EXIT_FRAMES, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scrim = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * exit;

  const centerPx = height * y;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Soft band behind the text */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: centerPx - 330,
          height: 660,
          opacity: scrim,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.38) 35%, rgba(0,0,0,0.38) 65%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: centerPx,
          transform: "translateY(-50%)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: pop ? "0.26em" : "0.24em",
          rowGap: pop ? 6 : 2,
          fontFamily: FONT_FAMILY,
          fontSize,
          fontWeight: 700,
          lineHeight: 1.06,
          textAlign: "center",
          opacity: exit,
        }}
      >
        {words.map((word, i) => {
          const start = i * step;
          const s = spring({
            frame: frame - start,
            fps,
            config: pop
              ? { damping: 11, stiffness: 190, mass: 0.6 }
              : { damping: 200, stiffness: 90 },
          });
          const appear = interpolate(frame - start, [0, pop ? 3 : 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const scale = pop ? interpolate(s, [0, 1], [0.62, 1]) : 1;
          const lift = interpolate(s, [0, 1], [pop ? 26 : 22, 0]);
          const isKey = keyIndex(i);
          return (
            <span
              key={`${i}-${word}`}
              style={{
                display: "inline-block",
                opacity: appear,
                transform: `translateY(${lift}px) scale(${scale})`,
                transformOrigin: "50% 80%",
                color: isKey ? highlight : "#ffffff",
                textTransform: pop ? "uppercase" : "none",
                letterSpacing: pop ? "0.01em" : "0.005em",
                textShadow: OUTLINE,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
