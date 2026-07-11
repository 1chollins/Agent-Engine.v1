import {
  C,
  FONT_HEADING,
  Monogram,
  Photo,
  priceLine,
  StatRow,
  type TemplateProps,
} from "./shared";

/** Arch-masked photo, centered serif — the trendy high-end look. */
export function ArchedTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, padding: "56px 64px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>
      <span style={{ color: C.tan, fontSize: 24, fontWeight: 600, letterSpacing: "0.32em", textTransform: "uppercase" }}>
        {p.eyebrow}
      </span>
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          width: "72%",
          position: "relative",
          overflow: "hidden",
          borderRadius: "9999px 9999px 0 0",
        }}
      >
        <Photo photoUrl={p.photoUrl} />
      </div>
      {p.headline ? (
        <div style={{ fontFamily: FONT_HEADING, fontSize: 54, fontWeight: 500, lineHeight: 1.04, color: C.forest }}>
          {p.headline}
        </div>
      ) : null}
      <div style={{ width: 56, height: 2, backgroundColor: C.tan }} />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <StatRow stats={p.stats} color="rgba(26,26,26,0.65)" dotColor={C.tan} size={26} />
      </div>
      <span style={{ color: C.tan, fontSize: 30, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
    </div>
  );
}

/** Photo masked into a circle, ringed in tan — formal and centered. */
export function CircleTemplate(p: TemplateProps) {
  const D = p.format === "facebook" ? 380 : p.format === "story" ? 640 : 620;
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, padding: 56, textAlign: "center" }}>
      <span style={{ color: C.tan, fontSize: 24, fontWeight: 600, letterSpacing: "0.32em", textTransform: "uppercase" }}>
        {p.eyebrow}
      </span>
      <div
        style={{
          width: D,
          height: D,
          borderRadius: "50%",
          overflow: "hidden",
          border: `3px solid ${C.tan}`,
          boxShadow: "0 22px 45px rgba(26,26,26,0.2)",
          flexShrink: 0,
        }}
      >
        <Photo photoUrl={p.photoUrl} />
      </div>
      {p.headline ? (
        <div style={{ fontFamily: FONT_HEADING, fontSize: 52, fontWeight: 500, lineHeight: 1.04, color: C.forest }}>
          {p.headline}
        </div>
      ) : null}
      <StatRow stats={p.stats} color="rgba(26,26,26,0.65)" dotColor={C.tan} size={26} />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ color: C.tan, fontSize: 30, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
        {p.cta ? (
          <>
            <span style={{ color: "rgba(26,26,26,0.3)" }}>|</span>
            <span style={{ color: C.forest, fontSize: 24, fontWeight: 600 }}>{p.cta}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

/** Thin framed invitation: all centered serif, photo windowed, lots of air. */
export function BorderedTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, padding: 46 }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          border: `1px solid ${C.forest}`,
          padding: "40px 44px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 20,
        }}
      >
        <Monogram size={44} bg={C.forest} />
        <span style={{ color: C.tan, fontSize: 22, fontWeight: 600, letterSpacing: "0.34em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 50, fontWeight: 500, lineHeight: 1.04, color: C.forest }}>
            {p.headline}
          </div>
        ) : null}
        <div style={{ flex: "1 1 auto", minHeight: 0, width: "100%", position: "relative", overflow: "hidden", border: `1px solid ${C.tan}` }}>
          <Photo photoUrl={p.photoUrl} />
        </div>
        <StatRow stats={p.stats} color="rgba(26,26,26,0.65)" dotColor={C.tan} size={24} />
        <div style={{ width: 50, height: 1, backgroundColor: C.tan }} />
        <span style={{ color: C.tan, fontSize: 28, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
      </div>
    </div>
  );
}

/** Wide photo with a slim elegant text column alongside. */
export function SideColumnTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "row" }}>
      <div style={{ flex: "1 1 64%", position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ width: "36%", backgroundColor: C.cream, padding: "56px 40px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
        <span style={{ color: C.tan, fontSize: 22, fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 50, fontWeight: 500, lineHeight: 1.03, color: C.forest }}>
            {p.headline}
          </div>
        ) : null}
        <div style={{ width: 44, height: 2, backgroundColor: C.tan }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, color: "rgba(26,26,26,0.7)", fontSize: 26 }}>
          {p.stats.map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
        <span style={{ color: C.tan, fontSize: 30, fontWeight: 700, marginTop: 4 }}>{priceLine(p.showPrice, p.price)}</span>
        {p.cta ? <span style={{ color: C.forest, fontSize: 22, fontWeight: 600 }}>{p.cta}</span> : null}
      </div>
    </div>
  );
}

/** Full-bleed photo inside a thin tan frame; restrained text, bottom-left. */
export function GoldLineTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0.1) 45%, rgba(26,26,26,0.2) 100%)",
        }}
      />
      <div style={{ position: "absolute", inset: 40, border: `1px solid rgba(242,235,216,0.65)` }} />
      <div style={{ position: "absolute", top: 64, right: 64 }}>
        <Monogram size={50} />
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 76, display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ color: C.tan, fontSize: 24, fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 60, fontWeight: 500, lineHeight: 1.02, color: C.cream }}>
            {p.headline}
          </div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(242,235,216,0.85)" dotColor={C.tan} size={26} />
        <span style={{ color: C.tan, fontSize: 32, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
      </div>
    </>
  );
}
