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

/** Bold color panel beside the photo, oversized headline, price block. */
export function ColorBlockTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "row" }}>
      <div
        style={{
          width: "44%",
          backgroundColor: C.forest,
          padding: "56px 44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span style={{ color: C.tan, fontSize: 24, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            {p.eyebrow}
          </span>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 60, fontWeight: 600, lineHeight: 1.0, color: C.cream }}>
              {p.headline}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <StatChips stats={p.stats} color={C.cream} borderColor="rgba(242,235,216,0.35)" size={22} />
          <div style={{ color: C.tan, fontSize: 40, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</div>
          <CtaPill cta={p.cta} bg={C.tan} fg={C.forest} />
        </div>
      </div>
      <div style={{ flex: "1 1 auto", position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
    </div>
  );
}

/** Photo washed in a forest→tan duotone gradient; big centered type. */
export function DuotoneTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(61,74,47,0.9) 0%, rgba(61,74,47,0.55) 45%, rgba(194,152,112,0.7) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 72,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 22,
        }}
      >
        <span style={{ color: C.cream, fontSize: 26, fontWeight: 700, letterSpacing: "0.34em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 82, fontWeight: 600, lineHeight: 1.0, color: C.cream }}>
            {p.headline}
          </div>
        ) : null}
        <div style={{ width: 70, height: 3, backgroundColor: C.cream }} />
        <StatRow stats={p.stats} color="rgba(242,235,216,0.92)" dotColor={C.cream} />
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 6 }}>
          <span style={{ color: C.cream, fontSize: 40, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
        </div>
        <CtaPill cta={p.cta} bg={C.cream} fg={C.forest} />
      </div>
    </>
  );
}

/** Full-bleed photo with an angled forest band carrying the details. */
export function DiagonalTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", top: 48, left: 56, right: 56, display: "flex", alignItems: "center", gap: 16 }}>
        <Monogram size={52} />
      </div>
      <div
        style={{
          position: "absolute",
          left: -60,
          right: -60,
          bottom: -80,
          top: "46%",
          backgroundColor: C.forest,
          transform: "skewY(-6deg)",
          transformOrigin: "bottom left",
        }}
      />
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 70, display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ color: C.tan, fontSize: 24, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 62, fontWeight: 500, lineHeight: 1.02, color: C.cream }}>
            {p.headline}
          </div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(242,235,216,0.9)" dotColor={C.tan} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginTop: 6 }}>
          <div style={{ color: C.tan, fontSize: 34, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</div>
          <CtaPill cta={p.cta} bg={C.tan} fg={C.forest} />
        </div>
      </div>
    </>
  );
}

/** Typography-forward: photo band on top, a giant headline + price dominate. */
export function BigTypeTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column" }}>
      <div style={{ height: "38%", position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flex: "1 1 auto", minHeight: 0, padding: "44px 56px 52px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ color: C.tan, fontSize: 24, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            {p.eyebrow}
          </span>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 84, fontWeight: 600, lineHeight: 0.96, color: C.forest }}>
              {p.headline}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StatRow stats={p.stats} color="rgba(26,26,26,0.7)" dotColor={C.tan} size={26} />
            <span style={{ color: C.tan, fontSize: 56, fontWeight: 700, lineHeight: 1 }}>{priceLine(p.showPrice, p.price)}</span>
          </div>
          <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} />
        </div>
      </div>
    </div>
  );
}

/** Bold tan matte frames the photo; forest tag + price chip. */
export function FramePopTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.tan, padding: 48, display: "flex", flexDirection: "column", gap: 26 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: C.forest, fontSize: 28, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        <Monogram size={52} bg={C.forest} fg={C.cream} />
      </div>
      <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative", overflow: "hidden", borderRadius: 4 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 50, fontWeight: 600, lineHeight: 1.0, color: C.forest }}>
              {p.headline}
            </div>
          ) : null}
          <StatRow stats={p.stats} color="rgba(61,74,47,0.85)" dotColor={C.forest} size={24} />
        </div>
        <div
          style={{
            backgroundColor: C.forest,
            color: C.cream,
            fontSize: 30,
            fontWeight: 700,
            padding: "14px 26px",
            borderRadius: 9999,
            whiteSpace: "nowrap",
          }}
        >
          {priceLine(p.showPrice, p.price)}
        </div>
      </div>
    </div>
  );
}
