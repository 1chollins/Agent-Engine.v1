/**
 * AgentOutro — closing card over a dark scrim: circular headshot,
 * agent name, brokerage, phone, email. Staggered spring entrance.
 * Headshot is optional (empty URL renders text-only).
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type AgentOutroProps = {
  agentName: string;
  brandName: string;
  phone: string;
  email: string;
  headshotUrl: string;
  enterFrame: number;
};

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const AgentOutro: React.FC<AgentOutroProps> = ({
  agentName,
  brandName,
  phone,
  email,
  headshotUrl,
  enterFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scrim = interpolate(frame - enterFrame, [0, 20], [0, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const items: Array<{ node: React.ReactNode; key: string }> = [];

  if (headshotUrl) {
    items.push({
      key: "headshot",
      node: (
        <Img
          src={headshotUrl}
          style={{
            width: 280,
            height: 280,
            borderRadius: "50%",
            objectFit: "cover",
            border: "6px solid rgba(255,255,255,0.9)",
          }}
        />
      ),
    });
  }
  if (agentName) {
    items.push({
      key: "name",
      node: (
        <div style={{ fontSize: 68, fontWeight: 700, color: "white" }}>
          {agentName}
        </div>
      ),
    });
  }
  if (brandName) {
    items.push({
      key: "brand",
      node: (
        <div style={{ fontSize: 46, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
          {brandName}
        </div>
      ),
    });
  }
  if (phone) {
    items.push({
      key: "phone",
      node: (
        <div style={{ fontSize: 42, fontWeight: 500, color: "white" }}>{phone}</div>
      ),
    });
  }
  if (email) {
    items.push({
      key: "email",
      node: (
        <div style={{ fontSize: 42, fontWeight: 500, color: "white" }}>{email}</div>
      ),
    });
  }

  return (
    <AbsoluteFill style={{ fontFamily: FONT_STACK }}>
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${scrim})` }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 28,
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        {items.map((item, i) => {
          const driver = spring({
            frame: frame - enterFrame - i * 8,
            fps,
            config: { damping: 200, stiffness: 110 },
          });
          return (
            <div
              key={item.key}
              style={{
                opacity: interpolate(driver, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(driver, [0, 1], [30, 0])}px)`,
              }}
            >
              {item.node}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
