/**
 * DetailsPanel — property stat lines on a soft scrim card.
 * Lines enter with a slight stagger driven by one spring.
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

type DetailsPanelProps = {
  lines: string[];
  enterFrame: number;
};

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  lines,
  enterFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 260 }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          padding: "48px 72px",
          borderRadius: 24,
          backgroundColor: "rgba(0,0,0,0.45)",
          alignItems: "center",
        }}
      >
        {lines.map((line, i) => {
          const driver = spring({
            frame: frame - enterFrame - i * 6,
            fps,
            config: { damping: 200, stiffness: 120 },
          });
          return (
            <div
              key={i}
              style={{
                opacity: interpolate(driver, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(driver, [0, 1], [24, 0])}px)`,
                color: "white",
                fontFamily: FONT_FAMILY,
                fontSize: 52,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textAlign: "center",
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
