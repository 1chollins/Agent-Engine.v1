import {
  C,
  CtaPill,
  Eyebrow,
  FONT_HEADING,
  Headshot,
  Monogram,
  Photo,
  priceLine,
  StatRow,
  Wordmark,
  type TemplateProps,
} from "./shared";

const marble = "#f4f2ee";

/** Huge translucent serif type over the photo, circle headshot, marble footer. */
export function StatementOverlayTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1.75, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 40px",
          }}
        >
          <div
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 130,
              lineHeight: 0.98,
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.82)",
              textShadow: "0 2px 24px rgba(26,26,26,0.25)",
            }}
          >
            {p.eyebrow}
          </div>
          {p.headline ? (
            <div style={{ fontSize: 30, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.92)", marginTop: 14, textShadow: "0 1px 14px rgba(26,26,26,0.4)" }}>
              {p.headline}
            </div>
          ) : null}
          <div style={{ fontSize: 26, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)", marginTop: 10, textShadow: "0 1px 14px rgba(26,26,26,0.4)" }}>
            {p.stats.join(" / ")}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, backgroundColor: marble, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "0 52px 34px" }}>
        <div style={{ position: "absolute", top: -85, left: "50%", transform: "translateX(-50%)" }}>
          <Headshot url={p.headshotUrl} name={p.agentName} size={170} ring={C.tan} bg={C.sage} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", alignSelf: "stretch", gap: 22 }}>
          <Wordmark color={C.black} size={22} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: FONT_HEADING, fontSize: 44, fontStyle: "italic", color: C.black, lineHeight: 1.05 }}>
              {p.agentName || "Your Name"}
            </div>
            {p.phone ? <div style={{ fontSize: 27, fontWeight: 600, color: C.black, marginTop: 6 }}>{p.phone}</div> : null}
          </div>
          <div style={{ textAlign: "right", fontSize: 20, color: "rgba(26,26,26,0.6)", lineHeight: 1.5 }}>
            {p.agentTitle ? <div>{p.agentTitle}</div> : null}
            {p.website ? <div>{p.website}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Outlined (hollow) giant type over full-bleed photo. */
export function StatementOutlineTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(26,26,26,0.28)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 44px" }}>
        <div
          style={{
            fontSize: 120,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "transparent",
            WebkitTextStroke: `3px ${C.cream}`,
          }}
        >
          {p.eyebrow}
        </div>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 40, color: C.cream, marginTop: 20, textShadow: "0 2px 16px rgba(26,26,26,0.5)" }}>{p.headline}</div>
        ) : null}
      </div>
      <div style={{ position: "absolute", left: 52, right: 52, bottom: 44, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <StatRow stats={p.stats} color={C.cream} dotColor={C.tan} size={24} />
        <CtaPill cta={p.cta} bg={C.cream} fg={C.forest} size={21} />
      </div>
    </>
  );
}

/** Vertical letter tower down the left, photo right. */
export function StatementTowerTemplate(p: TemplateProps) {
  const word = (p.eyebrow || "LISTED").split(" ")[0];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", backgroundColor: C.black }}>
      <div style={{ width: "26%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "36px 0" }}>
        <Monogram size={54} />
        <div
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: FONT_HEADING,
            fontSize: 108,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: C.tan,
            lineHeight: 1,
          }}
        >
          {word}
        </div>
        <div style={{ fontSize: 18, color: "rgba(242,235,216,0.6)", letterSpacing: "0.2em", textTransform: "uppercase", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          {p.website || "frameandformstudio.com"}
        </div>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(to top, rgba(26,26,26,0.88), rgba(26,26,26,0))",
            padding: "110px 44px 38px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 50, fontWeight: 500, lineHeight: 1.05, color: C.cream }}>{p.headline}</div>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <StatRow stats={p.stats} color="rgba(242,235,216,0.9)" dotColor={C.tan} size={23} />
            <span style={{ color: C.tan, fontSize: 27, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Giant type behind a floating photo card. */
export function StatementFadeTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_HEADING,
          fontSize: 190,
          fontWeight: 600,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          color: "rgba(194,152,112,0.28)",
          lineHeight: 0.95,
          whiteSpace: "nowrap",
        }}
      >
        {(p.eyebrow || "Featured").split(" ")[0]}
      </div>
      <div
        style={{
          position: "absolute",
          top: "16%",
          left: "12%",
          right: "12%",
          height: "56%",
          boxShadow: "0 30px 70px rgba(26,26,26,0.3)",
        }}
      >
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", left: "12%", right: "12%", bottom: "5%", display: "flex", flexDirection: "column", gap: 12 }}>
        <Eyebrow text={p.eyebrow} color={C.forest} />
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 48, fontWeight: 500, lineHeight: 1.06, color: C.black }}>{p.headline}</div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <StatRow stats={p.stats} color={C.black} dotColor={C.tan} size={23} />
          <span style={{ color: C.forest, fontSize: 27, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
        </div>
      </div>
    </div>
  );
}

/** Type-forward poster on cream with a small photo window. */
export function StatementPosterTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column", padding: "52px 56px 44px" }}>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Monogram size={54} />
        <span style={{ fontSize: 20, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(26,26,26,0.55)" }}>
          {p.address || "Southwest Florida"}
        </span>
      </div>
      <div style={{ flexShrink: 0, fontFamily: FONT_HEADING, fontSize: 112, fontWeight: 500, lineHeight: 0.98, color: C.black, textTransform: "uppercase", letterSpacing: "0.02em", padding: "34px 0 10px" }}>
        {p.eyebrow}
      </div>
      {p.headline ? (
        <div style={{ flexShrink: 0, fontSize: 30, lineHeight: 1.35, color: C.forest, maxWidth: "86%" }}>{p.headline}</div>
      ) : null}
      <div style={{ flex: 1, minHeight: 0, marginTop: 26, display: "flex", gap: 22 }}>
        <div style={{ flex: 1.5, position: "relative" }}>
          <Photo photoUrl={p.photoUrl} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14 }}>
          {p.features.slice(0, 3).map((f, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${C.tan}`, paddingLeft: 14, fontSize: 22, lineHeight: 1.35, color: "rgba(26,26,26,0.75)" }}>
              {f}
            </div>
          ))}
          <div style={{ color: C.forest, fontSize: 30, fontWeight: 700, marginTop: 8 }}>{priceLine(p.showPrice, p.price)}</div>
          <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={20} />
        </div>
      </div>
    </div>
  );
}

/** Half type / half photo, hard horizontal split. */
export function StatementSplitTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, backgroundColor: C.forest, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 60px", gap: 16 }}>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 104, fontWeight: 500, lineHeight: 0.98, color: C.cream, textTransform: "uppercase" }}>
          {p.eyebrow}
        </div>
        {p.headline ? <div style={{ fontSize: 28, color: "rgba(242,235,216,0.8)", lineHeight: 1.35 }}>{p.headline}</div> : null}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <StatRow stats={p.stats} color="rgba(242,235,216,0.9)" dotColor={C.tan} size={24} />
          <span style={{ color: C.tan, fontSize: 28, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
    </div>
  );
}

/** Underlined display headline above a photo card, tan baseline. */
export function StatementUnderlineTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#ffffff", display: "flex", flexDirection: "column", padding: "46px 56px 42px" }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: "inline-block", borderBottom: `6px solid ${C.tan}`, paddingBottom: 10, fontFamily: FONT_HEADING, fontSize: 86, fontWeight: 600, lineHeight: 1, color: C.black, textTransform: "uppercase", letterSpacing: "0.03em" }}>
          {p.eyebrow}
        </div>
        {p.headline ? <div style={{ fontSize: 27, color: "rgba(26,26,26,0.7)", marginTop: 14 }}>{p.headline}</div> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0, marginTop: 24, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, paddingTop: 20 }}>
        <StatRow stats={p.stats} color={C.black} dotColor={C.tan} size={24} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: C.forest, fontSize: 27, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
          <CtaPill cta={p.cta} bg={C.black} fg={C.cream} size={19} />
        </div>
      </div>
    </div>
  );
}

/** The stats ARE the design: giant numerals in a band. */
export function StatementNumbersTemplate(p: TemplateProps) {
  const parts = p.stats.slice(0, 4).map((s) => {
    const m = s.match(/^([\d,.$]+[KkMm+]?)\s*[- ]?\s*(.*)$/);
    return m ? { n: m[1], label: m[2] || "" } : { n: s, label: "" };
  });
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1.5, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 48,
            backgroundColor: C.forest,
            color: C.cream,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            padding: "12px 26px",
          }}
        >
          {p.eyebrow}
        </div>
      </div>
      <div style={{ flexShrink: 0, backgroundColor: C.black, display: "flex" }}>
        {parts.map((x, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", padding: "26px 8px", borderLeft: i > 0 ? "1px solid rgba(242,235,216,0.18)" : "none" }}>
            <div style={{ fontFamily: FONT_HEADING, fontSize: 62, fontWeight: 600, color: C.tan, lineHeight: 1 }}>{x.n}</div>
            {x.label ? (
              <div style={{ fontSize: 18, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(242,235,216,0.7)", marginTop: 8 }}>{x.label}</div>
            ) : null}
          </div>
        ))}
      </div>
      <div style={{ flexShrink: 0, backgroundColor: C.cream, padding: "20px 48px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <div style={{ minWidth: 0 }}>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 36, fontWeight: 600, lineHeight: 1.1, color: C.black }}>{p.headline}</div>
          ) : null}
          {p.address ? <div style={{ fontSize: 21, color: "rgba(26,26,26,0.62)", marginTop: 4 }}>{p.address}</div> : null}
        </div>
        <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={20} />
      </div>
    </div>
  );
}
