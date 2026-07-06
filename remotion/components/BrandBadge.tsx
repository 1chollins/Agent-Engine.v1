/**
 * BrandBadge — small logo + brand name lockup, top-center.
 * Renders gracefully when the logo URL is empty (text only).
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { FONT_FAMILY } from "../lib/fonts";

type BrandBadgeProps = {
  brandName: string;
  logoUrl: string;
};

export const BrandBadge: React.FC<BrandBadgeProps> = ({
  brandName,
  logoUrl,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 120,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "20px 40px",
          borderRadius: 999,
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      >
        {logoUrl ? (
          <Img
            src={logoUrl}
            style={{ height: 72, width: "auto", objectFit: "contain" }}
          />
        ) : null}
        {brandName ? (
          <div
            style={{
              color: "white",
              fontFamily: FONT_FAMILY,
              fontSize: 40,
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            {brandName}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
