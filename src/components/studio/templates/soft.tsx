import {
  C,
  CtaPill,
  FONT_HEADING,
  Monogram,
  Photo,
  priceLine,
  StatChips,
  StatRow,
  type TemplateProps,
} from "./shared";

/** Floating rounded photo with a soft shadow on cream; pill-chip stats. */
export function RoundedCardTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, padding: 56, display: "flex", flexDirection: "column", gap: 28 }}>
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          position: "relative",
          overflow: "hidden",
          borderRadius: 32,
          boxShadow: "0 26px 55px rgba(26,26,26,0.22)",
        }}
      >
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ color: C.tan, fontSize: 24, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 56, fontWeight: 600, lineHeight: 1.02, color: C.forest }}>
            {p.headline}
          </div>
        ) : null}
        <StatChips stats={p.stats} color={C.forest} borderColor="transparent" bg="rgba(155,166,138,0.35)" size={22} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginTop: 2 }}>
          <span style={{ color: C.tan, fontSize: 34, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
          <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} />
        </div>
      </div>
    </div>
  );
}

/** Snapshot polaroid on a sage ground, gently tilted. */
export function PolaroidTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.sage, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <div
        style={{
          width: "84%",
          height: "88%",
          backgroundColor: "#FFFFFF",
          padding: "22px 22px 0",
          boxShadow: "0 30px 60px rgba(26,26,26,0.3)",
          transform: "rotate(-2deg)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative", overflow: "hidden" }}>
          <Photo photoUrl={p.photoUrl} />
        </div>
        <div style={{ flexShrink: 0, padding: "20px 10px 26px", display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ color: C.tan, fontSize: 20, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            {p.eyebrow}
          </span>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 46, fontWeight: 600, lineHeight: 1.0, color: C.forest }}>
              {p.headline}
            </div>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <StatRow stats={p.stats} color="rgba(26,26,26,0.6)" dotColor={C.tan} size={22} />
            <span style={{ color: C.tan, fontSize: 28, fontWeight: 700, whiteSpace: "nowrap" }}>{priceLine(p.showPrice, p.price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Photo on top, stats as friendly circular bubbles. */
export function BubblesTemplate(p: TemplateProps) {
  const bubbleColors = [C.forest, C.tan, C.sage];
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column" }}>
      <div style={{ height: "52%", position: "relative", overflow: "hidden" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flex: "1 1 auto", minHeight: 0, padding: "40px 56px 48px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <span style={{ color: C.tan, fontSize: 24, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {p.eyebrow}
          </span>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 54, fontWeight: 600, lineHeight: 1.02, color: C.forest }}>
              {p.headline}
            </div>
          ) : null}
        </div>
        {p.stats.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            {p.stats.slice(0, 4).map((s, i) => (
              <div
                key={i}
                style={{
                  width: 118,
                  height: 118,
                  borderRadius: "50%",
                  backgroundColor: bubbleColors[i % bubbleColors.length],
                  color: C.cream,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: 1.1,
                  padding: 10,
                }}
              >
                {s}
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ color: C.tan, fontSize: 32, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
          {p.cta ? <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={20} /> : null}
        </div>
      </div>
    </div>
  );
}

/** Full-bleed photo with a soft floating info card over the lower area. */
export function NoteCardTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", top: 48, left: 56, display: "flex", alignItems: "center", gap: 14 }}>
        <Monogram size={50} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 56,
          right: 56,
          bottom: 56,
          backgroundColor: C.cream,
          borderRadius: 24,
          padding: "38px 40px",
          boxShadow: "0 24px 50px rgba(26,26,26,0.35)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <span style={{ color: C.tan, fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 52, fontWeight: 600, lineHeight: 1.02, color: C.forest }}>
            {p.headline}
          </div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(26,26,26,0.7)" dotColor={C.tan} size={26} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginTop: 4 }}>
          <span style={{ color: C.tan, fontSize: 32, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
          <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} />
        </div>
      </div>
    </>
  );
}

/** Soft sage mat framing a rounded photo — gentle and calm. */
export function PastelPanelTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, padding: 44 }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: C.sage,
          borderRadius: 36,
          padding: 34,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative", overflow: "hidden", borderRadius: 22 }}>
          <Photo photoUrl={p.photoUrl} />
        </div>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ color: C.forest, fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {p.eyebrow}
          </span>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 50, fontWeight: 600, lineHeight: 1.02, color: C.forest }}>
              {p.headline}
            </div>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <StatRow stats={p.stats} color="rgba(61,74,47,0.85)" dotColor={C.cream} size={24} />
            <span style={{ color: C.forest, fontSize: 30, fontWeight: 700, whiteSpace: "nowrap" }}>
              {priceLine(p.showPrice, p.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
