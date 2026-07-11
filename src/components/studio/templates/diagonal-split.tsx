import {
  C,
  ContactStack,
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

const charcoal = "#4a4a46";
const lightGray = "#d9d6ce";

/** Big banner headline, diagonal side panel, hero + two thumbs — broker classic. */
export function DiagonalProTemplate(p: TemplateProps) {
  const thumbs = p.photos.slice(1, 3);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundColor: charcoal }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(112deg, ${C.forest} 0%, ${C.forest} 26%, transparent 26.2%)`,
        }}
      />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            flexShrink: 0,
            padding: "30px 56px",
            fontFamily: FONT_HEADING,
            fontSize: 76,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: C.cream,
            textTransform: "uppercase",
            textAlign: "right",
          }}
        >
          {p.eyebrow || "For Sale"}
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          <div style={{ width: "30%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 0 40px 44px", gap: 16 }}>
            <Monogram size={58} bg={C.tan} />
            {p.address ? (
              <div style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.3, color: C.cream }}>{p.address}</div>
            ) : null}
            <StatRow stats={p.stats} color="rgba(242,235,216,0.85)" dotColor={C.tan} size={22} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, padding: "0 44px 0 10px" }}>
            <div style={{ flex: 2.2, minHeight: 0, position: "relative" }}>
              <Photo photoUrl={p.photoUrl} />
            </div>
            {thumbs.length > 0 ? (
              <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 10 }}>
                {thumbs.map((t, i) => (
                  <div key={i} style={{ flex: 1, position: "relative" }}>
                    <Photo photoUrl={t} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div
          style={{
            flexShrink: 0,
            marginTop: 26,
            backgroundColor: "#ffffff",
            padding: "22px 44px",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <Headshot url={p.headshotUrl} name={p.agentName} size={96} ring={C.tan} />
          <ContactStack name={p.agentName} role={p.agentTitle} phone={p.phone} color={C.black} mutedColor="rgba(26,26,26,0.62)" size={30} />
          <div style={{ marginLeft: "auto", textAlign: "right", display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            {p.website ? <span style={{ fontSize: 22, color: "rgba(26,26,26,0.62)" }}>{p.website}</span> : null}
            <Wordmark color={C.forest} size={20} />
          </div>
        </div>
      </div>
    </>
  );
}

/** Light diagonal with price badge — the price-reduction poster. */
export function DiagonalPriceTemplate(p: TemplateProps) {
  const thumbs = p.photos.slice(1, 3);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#ffffff" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(248deg, ${lightGray} 0%, ${lightGray} 24%, transparent 24.2%)`,
        }}
      />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, padding: "30px 44px 14px" }}>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "0.06em", color: C.black, maxWidth: "58%" }}>{p.address || p.headline}</div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.18em", color: C.tan, textTransform: "uppercase" }}>New Price</div>
            <div style={{ fontFamily: FONT_HEADING, fontSize: 52, fontWeight: 700, color: C.black, lineHeight: 1 }}>
              {priceLine(p.showPrice, p.price)}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 10, padding: "0 44px" }}>
          <div style={{ flex: 2.1, minHeight: 0, position: "relative" }}>
            <Photo photoUrl={p.photoUrl} />
          </div>
          {thumbs.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 10 }}>
              {thumbs.map((t, i) => (
                <div key={i} style={{ flex: 1, position: "relative" }}>
                  <Photo photoUrl={t} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div style={{ flexShrink: 0, backgroundColor: charcoal, marginTop: 18, padding: "14px 44px", textAlign: "center" }}>
          <StatRow stats={p.stats} color={C.cream} dotColor={C.tan} size={30} />
        </div>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "20px 44px 26px", gap: 22 }}>
          <Headshot url={p.headshotUrl} name={p.agentName} size={86} ring={lightGray} />
          <ContactStack name={p.agentName} role={p.agentTitle} phone={p.phone} color={C.black} mutedColor="rgba(26,26,26,0.6)" size={26} />
          <div
            style={{
              marginLeft: "auto",
              fontFamily: FONT_HEADING,
              fontSize: 54,
              fontWeight: 600,
              color: charcoal,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              lineHeight: 1,
              textAlign: "right",
            }}
          >
            {p.eyebrow}
          </div>
        </div>
      </div>
    </>
  );
}

/** Full photo, steep forest wedge bottom-left carrying the message. */
export function DiagonalWedgeTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(24deg, ${C.forest} 0%, ${C.forest} 38%, rgba(61,74,47,0) 38.3%)`,
        }}
      />
      <div style={{ position: "absolute", left: 52, right: "40%", bottom: 48, display: "flex", flexDirection: "column", gap: 14 }}>
        <Eyebrow text={p.eyebrow} />
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 56, fontWeight: 500, lineHeight: 1.05, color: C.cream }}>{p.headline}</div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(242,235,216,0.9)" dotColor={C.tan} size={24} />
        <div style={{ display: "flex" }}>
          <CtaPill cta={p.cta} bg={C.tan} fg={C.forest} size={22} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 44, right: 44 }}>
        <Monogram size={60} />
      </div>
    </>
  );
}

/** Rotated ribbon banner across the top corner of a full-bleed photo. */
export function DiagonalRibbonCornerTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 86,
          left: -160,
          transform: "rotate(-32deg)",
          backgroundColor: C.tan,
          color: C.forest,
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          padding: "18px 200px",
          boxShadow: "0 10px 30px rgba(26,26,26,0.35)",
          whiteSpace: "nowrap",
        }}
      >
        {p.eyebrow || "Featured"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(to top, rgba(26,26,26,0.9), rgba(26,26,26,0))",
          padding: "120px 56px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 60, fontWeight: 500, lineHeight: 1.04, color: C.cream }}>{p.headline}</div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <StatRow stats={p.stats} color="rgba(242,235,216,0.9)" dotColor={C.tan} size={25} />
          <div style={{ color: C.tan, fontSize: 30, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</div>
        </div>
      </div>
    </>
  );
}

/** Steep split: forest info column left, photo right. */
export function DiagonalDuoTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      <div
        style={{
          width: "44%",
          backgroundColor: C.forest,
          clipPath: "polygon(0 0, 100% 0, 78% 100%, 0 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
          padding: "60px 96px 60px 56px",
          zIndex: 1,
        }}
      >
        <Monogram size={62} />
        <Eyebrow text={p.eyebrow} />
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 54, fontWeight: 500, lineHeight: 1.06, color: C.cream }}>{p.headline}</div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(242,235,216,0.88)" dotColor={C.tan} size={23} />
        {p.features.length > 0 ? (
          <div style={{ fontSize: 22, lineHeight: 1.5, color: "rgba(242,235,216,0.66)" }}>{p.features.join("  ·  ")}</div>
        ) : null}
        <div style={{ color: C.tan, fontSize: 28, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</div>
      </div>
      <div style={{ flex: 1, marginLeft: "-6%", position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
    </div>
  );
}

/** Two slanted bands — photo above, cream info band below a slash divider. */
export function DiagonalStackTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "58%", clipPath: "polygon(0 0, 100% 0, 100% 82%, 0 100%)" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 48, display: "flex", flexDirection: "column", gap: 16 }}>
        <Eyebrow text={p.eyebrow} color={C.forest} />
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 60, fontWeight: 500, lineHeight: 1.04, color: C.black }}>{p.headline}</div>
        ) : null}
        <StatRow stats={p.stats} color={C.black} dotColor={C.tan} size={26} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
          <div style={{ color: C.forest, fontSize: 30, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</div>
          <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={22} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 40, left: 56 }}>
        <Monogram size={56} />
      </div>
    </>
  );
}

/** Diagonal contact spotlight — agent strip is the hero. */
export function DiagonalContactTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to top, ${charcoal} 0%, ${charcoal} 30%, transparent 46%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 0,
          backgroundColor: C.forest,
          color: C.cream,
          fontFamily: FONT_HEADING,
          fontSize: 46,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "14px 48px 14px 56px",
          clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)",
        }}
      >
        {p.eyebrow}
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 44, display: "flex", alignItems: "center", gap: 26 }}>
        <Headshot url={p.headshotUrl} name={p.agentName} size={128} ring={C.tan} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 34, fontWeight: 700, color: C.cream }}>{p.agentName || "Your Name"}</span>
          {p.agentTitle ? <span style={{ fontSize: 23, color: "rgba(242,235,216,0.75)" }}>{p.agentTitle}</span> : null}
          {p.phone ? <span style={{ fontSize: 24, color: C.tan, fontWeight: 600 }}>{p.phone}</span> : null}
          {p.website ? <span style={{ fontSize: 21, color: "rgba(242,235,216,0.7)" }}>{p.website}</span> : null}
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          {p.address ? (
            <div style={{ fontSize: 26, fontWeight: 600, color: C.cream, maxWidth: 380, lineHeight: 1.3 }}>{p.address}</div>
          ) : null}
          <StatRow stats={p.stats} color="rgba(242,235,216,0.85)" dotColor={C.tan} size={21} />
        </div>
      </div>
    </>
  );
}

/** Charcoal poster: slanted photo window over dark canvas, copy below. */
export function DiagonalWindowTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundColor: charcoal }} />
      <div
        style={{
          position: "absolute",
          top: "9%",
          left: "8%",
          right: "8%",
          height: "48%",
          clipPath: "polygon(0 6%, 100% 0, 100% 94%, 0 100%)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        }}
      >
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", left: "8%", right: "8%", bottom: "7%", display: "flex", flexDirection: "column", gap: 16 }}>
        <Eyebrow text={p.eyebrow} />
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 58, fontWeight: 500, lineHeight: 1.05, color: C.cream }}>{p.headline}</div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
          <StatRow stats={p.stats} color="rgba(242,235,216,0.85)" dotColor={C.tan} size={24} />
          <CtaPill cta={p.cta} bg={C.tan} fg={C.forest} size={21} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 34, left: "8%", display: "flex", alignItems: "center", gap: 14 }}>
        <Monogram size={48} />
        <Wordmark color={C.cream} size={18} />
      </div>
    </>
  );
}
