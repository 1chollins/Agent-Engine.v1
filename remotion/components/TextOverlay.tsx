/**
 * TextOverlay — branded text with a spring entrance.
 * Entrance frame is passed in (derive it from the seed at the call site).
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

type TextOverlayProps = {
  text: string;
  enterFrame: number;
  position?: "bottom" | "center" | "top";
  fontSize?: number;
  uppercase?: boolean;
};

export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  enterFrame,
  position = "bottom",
  fontSize = 64,
  uppercase = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const driver = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const opacity = interpolate(driver, [0, 1], [0, 1]);
  const translateY = interpolate(driver, [0, 1], [40, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent:
          position === "bottom"
            ? "flex-end"
            : position === "top"
              ? "flex-start"
              : "center",
        alignItems: "center",
        paddingBottom: position === "bottom" ? 220 : 0,
        paddingTop: position === "top" ? 200 : 0,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          color: "white",
          fontFamily: FONT_FAMILY,
          fontSize,
          fontWeight: 600,
          letterSpacing: uppercase ? "0.25em" : "0.04em",
          textTransform: uppercase ? "uppercase" : "none",
          textAlign: "center",
          textShadow: "0 2px 24px rgba(0,0,0,0.55)",
          padding: "0 80px",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
