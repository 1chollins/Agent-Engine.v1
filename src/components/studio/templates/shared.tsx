import { type CSSProperties, type ReactNode } from "react";

import { type PostFormat } from "@/lib/studio-post-types";

/** Brand hex values (mirrors BRAND.md / globals.css). Inline so PNG export is exact. */
export const C = {
  cream: "#F2EBD8",
  tan: "#C29870",
  sage: "#9BA68A",
  forest: "#3D4A2F",
  black: "#1A1A1A",
} as const;

export const FONT_HEADING = "var(--font-cormorant), Georgia, serif";
export const FONT_BODY = "var(--font-inter), system-ui, sans-serif";
export const FONT_SCRIPT = "'Segoe Script', 'Brush Script MT', 'Snell Roundhand', cursive";

/** The content a template renders — everything except which template is chosen. */
export type TemplateProps = {
  format: PostFormat;
  eyebrow: string;
  headline: string;
  stats: readonly string[];
  features: readonly string[];
  price: string;
  showPrice: boolean;
  cta: string;
  photoUrl: string | null;
  /** All uploaded photos, hero first — used by the multi-photo / collage templates. */
  photos: readonly string[];
  agentName: string;
  agentTitle: string;
  headshotUrl: string | null;
  phone: string;
  website: string;
  address: string;
  logoUrl: string | null;
  /* Co-brand partner (title company, lender, co-listing agent). */
  partnerName: string;
  partnerRole: string;
  partnerPhone: string;
  partnerHeadshotUrl: string | null;
  /* Agent-promo extras. */
  services: readonly string[];
  socialHandle: string;
  tagline: string;
  email: string;
};

export const priceLine = (showPrice: boolean, price: string): string =>
  showPrice ? price.trim() || "Inquire for pricing" : "Inquire for rates";

/* ------------------------------------------------------------------ pieces */

export function Monogram({
  size = 64,
  bg = C.tan,
  fg = C.cream,
}: {
  size?: number;
  bg?: string;
  fg?: string;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_HEADING,
        fontSize: size * 0.4,
        fontWeight: 600,
        letterSpacing: "0.02em",
        flexShrink: 0,
      }}
    >
      F&amp;F
    </div>
  );
}

export function Wordmark({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
      <span style={{ fontFamily: FONT_HEADING, fontSize: size, fontWeight: 600, letterSpacing: "0.04em", color }}>
        Frame &amp; Form Studio
      </span>
      <span
        style={{
          fontFamily: FONT_BODY,
          fontSize: size * 0.42,
          letterSpacing: "0.34em",
          textTransform: "uppercase",
          color,
          opacity: 0.8,
        }}
      >
        SWFL Real Estate Media
      </span>
    </div>
  );
}

export function Eyebrow({ text, color = C.tan }: { text: string; color?: string }) {
  if (!text) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ width: 48, height: 2, backgroundColor: color, display: "inline-block" }} />
      <span style={{ color, fontSize: 26, fontWeight: 600, letterSpacing: "0.26em", textTransform: "uppercase" }}>
        {text}
      </span>
    </div>
  );
}

export function StatRow({
  stats,
  color,
  dotColor,
  size = 30,
}: {
  stats: readonly string[];
  color: string;
  dotColor: string;
  size?: number;
}) {
  if (stats.length === 0) return null;
  return (
    <div style={{ fontSize: size, letterSpacing: "0.01em", color }}>
      {stats.map((s, i) => (
        <span key={i}>
          {i > 0 ? <span style={{ color: dotColor, padding: "0 12px" }}>·</span> : null}
          {s}
        </span>
      ))}
    </div>
  );
}

/** Stats as separate pill chips (soft / graphic templates). */
export function StatChips({
  stats,
  color,
  borderColor,
  bg = "transparent",
  size = 24,
}: {
  stats: readonly string[];
  color: string;
  borderColor: string;
  bg?: string;
  size?: number;
}) {
  if (stats.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {stats.map((s, i) => (
        <span
          key={i}
          style={{
            border: `1px solid ${borderColor}`,
            backgroundColor: bg,
            color,
            fontSize: size,
            padding: "8px 18px",
            borderRadius: 9999,
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

export function CtaPill({ cta, bg, fg, size = 24 }: { cta: string; bg: string; fg: string; size?: number }) {
  if (!cta) return null;
  return (
    <div
      style={{
        backgroundColor: bg,
        color: fg,
        fontSize: size,
        fontWeight: 600,
        padding: "16px 30px",
        borderRadius: 9999,
        whiteSpace: "nowrap",
      }}
    >
      {cta}
    </div>
  );
}

export function Photo({ photoUrl, style }: { photoUrl: string | null; style?: CSSProperties }) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }} />;
  }
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: C.sage,
        color: C.cream,
        fontSize: 30,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        opacity: 0.85,
        ...style,
      }}
    >
      Upload a photo
    </div>
  );
}

/** Circular headshot with graceful monogram fallback. */
export function Headshot({
  url,
  name,
  size = 120,
  ring = C.tan,
  bg = C.sage,
}: {
  url: string | null;
  name: string;
  size?: number;
  ring?: string;
  bg?: string;
}) {
  const initial = (name.trim()[0] || "A").toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        border: `3px solid ${ring}`,
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <span style={{ fontFamily: FONT_HEADING, fontSize: size * 0.42, color: C.cream }}>{initial}</span>
      )}
    </div>
  );
}

/** Name / role / phone stack used by contact + co-brand footers. */
export function ContactStack({
  name,
  role,
  phone,
  color,
  mutedColor,
  size = 26,
}: {
  name: string;
  role: string;
  phone: string;
  color: string;
  mutedColor: string;
  size?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <span style={{ fontSize: size, fontWeight: 700, color }}>{name || "Your Name"}</span>
      {role ? <span style={{ fontSize: size * 0.72, color: mutedColor }}>{role}</span> : null}
      {phone ? <span style={{ fontSize: size * 0.78, color: mutedColor }}>{phone}</span> : null}
    </div>
  );
}

export type TemplateRenderer = (p: TemplateProps) => ReactNode;
