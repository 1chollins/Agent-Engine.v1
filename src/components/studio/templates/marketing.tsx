import { type ReactNode } from "react";

import {
  C,
  FONT_HEADING,
  Monogram,
  Photo,
  priceLine,
  StatRow,
  Wordmark,
  type TemplateProps,
} from "./shared";

/* Rectangular, bold CTA button — more "marketing" than the rounded pill. */
function CtaButton({ cta, bg, fg, size = 24 }: { cta: string; bg: string; fg: string; size?: number }) {
  if (!cta) return null;
  return (
    <div
      style={{
        backgroundColor: bg,
        color: fg,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "16px 32px",
        borderRadius: 8,
        whiteSpace: "nowrap",
        textAlign: "center",
      }}
    >
      {cta}
    </div>
  );
}

/* Small line-art icon matched to a stat label (bed/bath/garage/sqft/pool). */
function StatIcon({ label, color, size = 36 }: { label: string; color: string; size?: number }) {
  const l = label.toLowerCase();
  let path: ReactNode;
  if (l.includes("bed")) {
    path = <path d="M2 17v-4a2 2 0 012-2h16a2 2 0 012 2v4M2 17h20M3 17v2M21 17v2M6 11V8h5v3" />;
  } else if (l.includes("bath")) {
    path = <path d="M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3zM6 12V6a2 2 0 014 0M6 20l-1 2M19 20l1 2" />;
  } else if (l.includes("garage") || l.includes("car")) {
    path = <path d="M5 13l1.5-4.5A2 2 0 017.4 7h9.2a2 2 0 011.9 1.5L19 13M4 13h16v4H4zM7 17v2M17 17v2" />;
  } else if (l.includes("sq")) {
    path = <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />;
  } else if (l.includes("pool")) {
    path = <path d="M2 16c2 0 2-1.5 4-1.5S10 16 12 16s2-1.5 4-1.5S20 16 22 16M2 20c2 0 2-1.5 4-1.5S10 20 12 20s2-1.5 4-1.5S20 20 22 20M8 15V5a2 2 0 014 0v10M8 9h4" />;
  } else {
    path = <path d="M3 11l9-7 9 7M5 10v9h14v-9" />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}

function Check({ color }: { color: string }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

/** Full photo + bold bottom band with a big CTA button. */
export function CtaBannerTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", top: 52, left: 56, right: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Monogram size={50} />
        <span style={{ color: C.cream, fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          {p.eyebrow}
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: C.forest, padding: "40px 56px 44px", display: "flex", flexDirection: "column", gap: 18 }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 56, fontWeight: 600, lineHeight: 1.0, color: C.cream }}>
            {p.headline}
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <StatRow stats={p.stats} color="rgba(242,235,216,0.9)" dotColor={C.tan} size={26} />
            <span style={{ color: C.tan, fontSize: 38, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
          </div>
          <CtaButton cta={p.cta} bg={C.tan} fg={C.forest} />
        </div>
      </div>
    </>
  );
}

/** Photo top + cream panel with a feature checklist and CTA. */
export function ChecklistTemplate(p: TemplateProps) {
  const features = p.features.filter((f) => f.trim());
  return (
    <>
      <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, backgroundColor: C.cream, padding: "44px 56px 48px", display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ color: C.tan, fontSize: 24, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 52, fontWeight: 600, lineHeight: 1.02, color: C.forest }}>
            {p.headline}
          </div>
        ) : null}
        {features.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "flex", width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(194,152,112,0.2)", alignItems: "center", justifyContent: "center" }}>
                  <Check color={C.tan} />
                </span>
                <span style={{ color: C.black, fontSize: 26 }}>{f}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginTop: 6 }}>
          <span style={{ color: C.tan, fontSize: 34, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
          <CtaButton cta={p.cta} bg={C.forest} fg={C.cream} />
        </div>
      </div>
    </>
  );
}

/** Photo top + a row of stat cards each with a matching icon. */
export function IconStatsTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, backgroundColor: C.cream, padding: "40px 56px 46px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ color: C.tan, fontSize: 24, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {p.eyebrow}
          </span>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 50, fontWeight: 600, lineHeight: 1.02, color: C.forest }}>
              {p.headline}
            </div>
          ) : null}
        </div>
        {p.stats.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {p.stats.map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 22px", backgroundColor: "#FFFFFF", borderRadius: 14, minWidth: 110, boxShadow: "0 6px 16px rgba(26,26,26,0.08)" }}>
                <StatIcon label={s} color={C.forest} />
                <span style={{ color: C.black, fontSize: 20, fontWeight: 600, textAlign: "center" }}>{s}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <span style={{ color: C.tan, fontSize: 34, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
          <CtaButton cta={p.cta} bg={C.forest} fg={C.cream} />
        </div>
      </div>
    </>
  );
}

/** Price-forward: big price-tag graphic over the photo. */
export function PriceTagTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0) 55%)" }} />
      <div style={{ position: "absolute", top: 52, left: 56, display: "flex", alignItems: "center", gap: 14 }}>
        <Monogram size={50} />
      </div>
      <div style={{ position: "absolute", top: 56, right: 0, display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, backgroundColor: C.tan, color: C.forest, padding: "18px 30px 18px 34px", borderRadius: "9999px 0 0 9999px", boxShadow: "0 12px 28px rgba(26,26,26,0.35)" }}>
          <span style={{ width: 16, height: 16, borderRadius: "50%", border: `3px solid ${C.forest}`, display: "block" }} />
          <span style={{ fontSize: 40, fontWeight: 800 }}>{priceLine(p.showPrice, p.price)}</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 64, display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ color: C.tan, fontSize: 24, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>{p.eyebrow}</span>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 60, fontWeight: 500, lineHeight: 1.02, color: C.cream }}>
            {p.headline}
          </div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(242,235,216,0.9)" dotColor={C.tan} />
        <div style={{ marginTop: 6 }}>
          <CtaButton cta={p.cta} bg={C.cream} fg={C.forest} />
        </div>
      </div>
    </>
  );
}

/** 50/50 split: photo + forest sell panel with checklist and big CTA. */
export function SplitSellTemplate(p: TemplateProps) {
  const features = p.features.filter((f) => f.trim()).slice(0, 4);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "row" }}>
      <div style={{ flex: "1 1 50%", position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ width: "50%", backgroundColor: C.forest, padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ color: C.tan, fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>{p.eyebrow}</span>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 48, fontWeight: 600, lineHeight: 1.02, color: C.cream }}>
              {p.headline}
            </div>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Check color={C.tan} />
                <span style={{ color: "rgba(242,235,216,0.92)", fontSize: 24 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ color: C.tan, fontSize: 38, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
          <CtaButton cta={p.cta} bg={C.tan} fg={C.forest} />
        </div>
      </div>
    </div>
  );
}

/** Photo + agent-card contact bar with brand + CTA. */
export function ContactCardTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,26,26,0.55) 0%, rgba(26,26,26,0) 40%)" }} />
        <div style={{ position: "absolute", left: 56, right: 56, bottom: 40, display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ color: C.tan, fontSize: 22, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>{p.eyebrow}</span>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 56, fontWeight: 500, lineHeight: 1.0, color: C.cream }}>
              {p.headline}
            </div>
          ) : null}
          <StatRow stats={p.stats} color="rgba(242,235,216,0.9)" dotColor={C.tan} />
        </div>
      </div>
      <div style={{ flexShrink: 0, backgroundColor: C.forest, padding: "26px 44px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Monogram size={52} />
          <Wordmark color={C.cream} size={20} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {p.showPrice ? <span style={{ color: C.tan, fontSize: 30, fontWeight: 700, whiteSpace: "nowrap" }}>{priceLine(p.showPrice, p.price)}</span> : null}
          <CtaButton cta={p.cta} bg={C.tan} fg={C.forest} size={20} />
        </div>
      </div>
    </>
  );
}
