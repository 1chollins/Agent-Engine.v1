/**
 * Watermark — the free-tier badge rendered into every video.
 *
 * Visibility is driven by the top-level `watermark` input prop (set by
 * the render pipeline for unpaid packages; paid renders omit it). The
 * component reads inputProps directly so individual compositions don't
 * need schema or prop changes.
 *
 * Two layers: a corner pill (always readable) and a faint diagonal
 * wordmark (prevents cropping the pill away). Both deliberately subtle
 * enough that free content is genuinely usable — the watermark is an
 * ad, not a punishment.
 */
import React from "react";
import { AbsoluteFill, getInputProps } from "remotion";

const BRAND_TEXT = "frameandformstudio.com";

export const Watermark: React.FC = () => {
  const inputProps = getInputProps() as { watermark?: boolean };
  if (!inputProps?.watermark) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50 }}>
      {/* Faint diagonal wordmark across the center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-24deg)",
          fontFamily: "Inter, sans-serif",
          fontSize: 54,
          fontWeight: 600,
          letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.14)",
          whiteSpace: "nowrap",
          textShadow: "0 1px 8px rgba(0,0,0,0.10)",
        }}
      >
        {BRAND_TEXT}
      </div>

      {/* Corner pill */}
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 36,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px",
          borderRadius: 999,
          backgroundColor: "rgba(0,0,0,0.38)",
          backdropFilter: "blur(4px)",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 24,
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.02em",
          }}
        >
          Made with {BRAND_TEXT}
        </span>
      </div>
    </AbsoluteFill>
  );
};
