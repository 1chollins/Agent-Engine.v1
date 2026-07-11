import {
  C,
  CtaPill,
  FONT_BODY,
  FONT_HEADING,
  Monogram,
  Photo,
  priceLine,
  StatChips,
  StatRow,
  type TemplateProps,
} from "./shared";

/** Full photo with a circular badge sticker + price-tag ribbon. */
export function StickerTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0) 42%)",
        }}
      />
      <div style={{ position: "absolute", top: 52, left: 56 }}>
        <Monogram size={50} />
      </div>
      {p.eyebrow ? (
        <div
          style={{
            position: "absolute",
            top: 56,
            right: 56,
            width: 196,
            height: 196,
            borderRadius: "50%",
            backgroundColor: C.tan,
            color: C.forest,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            transform: "rotate(-8deg)",
            boxShadow: "0 14px 30px rgba(26,26,26,0.35)",
            border: `3px solid ${C.cream}`,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            lineHeight: 1.1,
            padding: 16,
            fontFamily: FONT_HEADING,
          }}
        >
          {p.eyebrow}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 64, display: "flex", flexDirection: "column", gap: 16 }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 62, fontWeight: 500, lineHeight: 1.02, color: C.cream }}>
            {p.headline}
          </div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(242,235,216,0.9)" dotColor={C.tan} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6 }}>
          <span
            style={{
              backgroundColor: C.tan,
              color: C.forest,
              fontSize: 32,
              fontWeight: 700,
              padding: "12px 28px 12px 22px",
              borderRadius: "6px 9999px 9999px 6px",
              whiteSpace: "nowrap",
            }}
          >
            {priceLine(p.showPrice, p.price)}
          </span>
          {p.cta ? <CtaPill cta={p.cta} bg={C.cream} fg={C.forest} size={22} /> : null}
        </div>
      </div>
    </>
  );
}

/** Magazine cover: serif masthead, cover lines, price flash. */
export function MagazineTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(26,26,26,0.55) 0%, rgba(26,26,26,0) 30%, rgba(26,26,26,0) 55%, rgba(26,26,26,0.8) 100%)",
        }}
      />
      <div style={{ position: "absolute", top: 56, left: 56, right: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 88, fontWeight: 600, lineHeight: 0.95, color: C.cream, textAlign: "center", letterSpacing: "0.01em" }}>
            {p.headline}
          </div>
        ) : null}
        <span style={{ color: C.tan, fontSize: 24, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
      </div>
      <div style={{ position: "absolute", left: 64, bottom: 76, maxWidth: "62%", display: "flex", flexDirection: "column", gap: 10 }}>
        {p.features.slice(0, 3).map((f, i) => (
          <span key={i} style={{ color: C.cream, fontSize: 26, fontWeight: 500 }}>
            <span style={{ color: C.tan, marginRight: 10 }}>—</span>
            {f}
          </span>
        ))}
        <div style={{ marginTop: 6 }}>
          <StatRow stats={p.stats} color="rgba(242,235,216,0.85)" dotColor={C.tan} size={24} />
        </div>
      </div>
      <div style={{ position: "absolute", right: 64, bottom: 76, textAlign: "right" }}>
        <span style={{ color: C.tan, fontSize: 40, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
      </div>
    </>
  );
}

/** Corner ribbon banner + solid bottom info bar. */
export function RibbonTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      {p.eyebrow ? (
        <div
          style={{
            position: "absolute",
            top: 54,
            left: -78,
            width: 360,
            transform: "rotate(-45deg)",
            transformOrigin: "center",
            backgroundColor: C.tan,
            color: C.forest,
            textAlign: "center",
            padding: "12px 0",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            boxShadow: "0 8px 20px rgba(26,26,26,0.3)",
          }}
        >
          {p.eyebrow}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: C.forest, padding: "36px 56px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 48, fontWeight: 500, lineHeight: 1.0, color: C.cream }}>
              {p.headline}
            </div>
          ) : null}
          <StatRow stats={p.stats} color="rgba(242,235,216,0.85)" dotColor={C.tan} size={24} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span style={{ color: C.tan, fontSize: 36, fontWeight: 700, whiteSpace: "nowrap" }}>{priceLine(p.showPrice, p.price)}</span>
          {p.cta ? <span style={{ color: C.cream, fontSize: 20, fontWeight: 600 }}>{p.cta}</span> : null}
        </div>
      </div>
    </>
  );
}

/** Retro blocks: solid bands top + bottom, condensed uppercase type. */
export function RetroTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column" }}>
      <div style={{ backgroundColor: C.forest, padding: "28px 56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: C.cream, fontFamily: FONT_BODY, fontSize: 30, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        <Monogram size={44} bg={C.tan} fg={C.forest} />
      </div>
      <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ backgroundColor: C.tan, padding: "30px 56px", display: "flex", flexDirection: "column", gap: 12 }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_BODY, fontSize: 46, fontWeight: 800, lineHeight: 1.0, color: C.forest, letterSpacing: "0.01em", textTransform: "uppercase" }}>
            {p.headline}
          </div>
        ) : null}
        <div style={{ borderTop: `2px dashed rgba(61,74,47,0.5)`, paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <StatRow stats={p.stats} color="rgba(61,74,47,0.9)" dotColor={C.forest} size={24} />
          <span style={{ color: C.forest, fontSize: 36, fontWeight: 800, whiteSpace: "nowrap" }}>{priceLine(p.showPrice, p.price)}</span>
        </div>
      </div>
    </div>
  );
}

/** Tag chips + a ticket-stub price with punch notches. */
export function TicketTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, padding: "38px 56px 46px", display: "flex", flexDirection: "column", gap: 18 }}>
        <span style={{ color: C.tan, fontSize: 24, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 52, fontWeight: 600, lineHeight: 1.02, color: C.forest }}>
            {p.headline}
          </div>
        ) : null}
        <StatChips stats={p.stats} color={C.forest} borderColor="rgba(155,166,138,0.8)" size={22} />
        {/* ticket stub */}
        <div style={{ display: "flex", alignItems: "stretch", marginTop: 2 }}>
          <div style={{ backgroundColor: C.forest, color: C.cream, fontSize: 32, fontWeight: 700, padding: "16px 28px", borderRadius: "10px 0 0 10px", whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
            {priceLine(p.showPrice, p.price)}
          </div>
          <div style={{ position: "relative", width: 0, borderLeft: `3px dashed ${C.cream}`, backgroundColor: C.forest }}>
            <div style={{ position: "absolute", top: -10, left: -10, width: 20, height: 20, borderRadius: "50%", backgroundColor: C.cream }} />
            <div style={{ position: "absolute", bottom: -10, left: -10, width: 20, height: 20, borderRadius: "50%", backgroundColor: C.cream }} />
          </div>
          {p.cta ? (
            <div style={{ backgroundColor: C.forest, color: C.tan, fontSize: 22, fontWeight: 600, padding: "16px 28px", borderRadius: "0 10px 10px 0", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
              {p.cta}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
