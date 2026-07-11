import {
  C,
  ContactStack,
  CtaPill,
  FONT_HEADING,
  Headshot,
  Monogram,
  Photo,
  priceLine,
  StatRow,
  Wordmark,
  type TemplateProps,
} from "./shared";

/** Classic flyer: hero, FOR SALE bar + agent card, three-photo strip. */
export function FlyerClassicTemplate(p: TemplateProps) {
  const strip = p.photos.slice(1, 4);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 2.4, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "stretch", gap: 20, padding: "26px 40px" }}>
        <div style={{ flex: 1.2, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
          <div style={{ fontFamily: FONT_HEADING, fontSize: 62, fontWeight: 600, letterSpacing: "0.12em", color: C.black, textTransform: "uppercase", lineHeight: 1 }}>
            {p.eyebrow}
          </div>
          <div style={{ backgroundColor: "#eee9dd", padding: "12px 16px", fontSize: 24, lineHeight: 1.35, color: C.black }}>
            {p.address || p.headline}
          </div>
        </div>
        <div style={{ flex: 1, backgroundColor: "#f4f1ea", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <span style={{ fontFamily: FONT_HEADING, fontSize: 30, fontWeight: 700, color: C.black, lineHeight: 1.1 }}>
              {p.agentName || "Your Name"}
            </span>
            {p.agentTitle ? <span style={{ fontSize: 20, color: "rgba(26,26,26,0.65)" }}>{p.agentTitle}</span> : null}
            {p.phone ? <span style={{ fontSize: 21, fontWeight: 700, color: C.black }}>{p.phone}</span> : null}
            {p.partnerName ? (
              <span style={{ fontSize: 20, color: "rgba(26,26,26,0.75)" }}>
                {p.partnerPhone ? `${p.partnerPhone} ` : ""}{p.partnerName}
              </span>
            ) : null}
          </div>
          <div style={{ marginLeft: "auto", display: "flex" }}>
            <Headshot url={p.headshotUrl} name={p.agentName} size={92} ring="#dcd6c8" />
          </div>
        </div>
      </div>
      {strip.length > 0 ? (
        <div style={{ flex: 1.15, minHeight: 0, display: "flex", gap: 12, padding: "0 40px 34px" }}>
          {strip.map((s, i) => (
            <div key={i} style={{ flex: 1, position: "relative" }}>
              <Photo photoUrl={s} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "0 40px 30px" }}>
          <StatRow stats={p.stats} color={C.black} dotColor={C.tan} size={26} />
        </div>
      )}
    </div>
  );
}

/** Hero + two stacked side photos, info band through the middle. */
export function FlyerTriTemplate(p: TemplateProps) {
  const side = p.photos.slice(1, 3);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1.9, minHeight: 0, display: "flex", gap: 10, padding: "34px 40px 0" }}>
        <div style={{ flex: 2, position: "relative" }}>
          <Photo photoUrl={p.photoUrl} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ flex: 1, minHeight: 0, position: "relative" }}>
              <Photo photoUrl={side[i] ?? null} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ flexShrink: 0, margin: "22px 40px 0", backgroundColor: C.forest, padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <span style={{ fontFamily: FONT_HEADING, fontSize: 40, fontWeight: 600, letterSpacing: "0.1em", color: C.cream, textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        <span style={{ color: C.tan, fontSize: 30, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, padding: "14px 40px 30px" }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 46, fontWeight: 500, lineHeight: 1.06, color: C.black }}>{p.headline}</div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <StatRow stats={p.stats} color={C.black} dotColor={C.tan} size={24} />
          <CtaPill cta={p.cta} bg={C.tan} fg={C.forest} size={20} />
        </div>
      </div>
    </div>
  );
}

/** Bordered brochure: serif masthead, photo plate, feature columns. */
export function FlyerBrochureTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 22, border: `2px solid ${C.forest}`, backgroundColor: C.cream, display: "flex", flexDirection: "column", padding: "34px 44px" }}>
      <div style={{ flexShrink: 0, textAlign: "center", paddingBottom: 20 }}>
        <div style={{ fontSize: 20, letterSpacing: "0.3em", color: C.tan, textTransform: "uppercase", fontWeight: 700 }}>{p.eyebrow}</div>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 54, fontWeight: 500, lineHeight: 1.05, color: C.black, marginTop: 8 }}>
          {p.headline || p.address || "Your headline"}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", gap: 26, paddingTop: 22 }}>
        {p.features.slice(0, 3).map((f, i) => (
          <div key={i} style={{ flex: 1, borderTop: `2px solid ${C.tan}`, paddingTop: 10, fontSize: 21, lineHeight: 1.4, color: "rgba(26,26,26,0.78)" }}>
            {f}
          </div>
        ))}
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, gap: 16 }}>
        <StatRow stats={p.stats} color={C.forest} dotColor={C.tan} size={22} />
        <div style={{ color: C.forest, fontSize: 26, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "center", paddingTop: 16, borderTop: "1px solid rgba(61,74,47,0.25)", marginTop: 14 }}>
        <span style={{ fontSize: 19, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(26,26,26,0.6)" }}>
          {p.agentName ? `${p.agentName} · ` : ""}{p.phone ? `${p.phone} · ` : ""}{p.website || "frameandformstudio.com"}
        </span>
      </div>
    </div>
  );
}

/** Full-bleed photo with floating white info bar. */
export function FlyerInfoBarTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 44,
          right: 44,
          bottom: 44,
          backgroundColor: "rgba(255,255,255,0.96)",
          borderRadius: 18,
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          boxShadow: "0 18px 50px rgba(26,26,26,0.35)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: "0.22em", color: C.tan, textTransform: "uppercase" }}>{p.eyebrow}</span>
          <span style={{ fontFamily: FONT_HEADING, fontSize: 38, fontWeight: 600, lineHeight: 1.08, color: C.black }}>
            {p.headline || p.address}
          </span>
          <StatRow stats={p.stats} color="rgba(26,26,26,0.75)" dotColor={C.tan} size={21} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <span style={{ color: C.forest, fontSize: 30, fontWeight: 800 }}>{priceLine(p.showPrice, p.price)}</span>
          <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={19} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 40, left: 44, display: "flex", alignItems: "center", gap: 14 }}>
        <Monogram size={52} />
      </div>
    </>
  );
}

/** Six-tile mosaic: four photos + eyebrow tile + stats tile. */
export function FlyerGridSixTemplate(p: TemplateProps) {
  const ph = [p.photoUrl, ...p.photos.slice(1, 4)];
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column", gap: 12, padding: 40 }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 12 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Photo photoUrl={ph[0] ?? null} />
        </div>
        <div style={{ flex: 1, backgroundColor: C.forest, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, textAlign: "center" }}>
          <Monogram size={54} />
          <span style={{ fontFamily: FONT_HEADING, fontSize: 42, fontWeight: 600, letterSpacing: "0.1em", color: C.cream, textTransform: "uppercase", lineHeight: 1.1 }}>
            {p.eyebrow}
          </span>
          <span style={{ color: C.tan, fontSize: 26, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          <Photo photoUrl={ph[1] ?? null} />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 12 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Photo photoUrl={ph[2] ?? null} />
        </div>
        <div style={{ flex: 1, backgroundColor: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, padding: 26 }}>
          {p.headline ? (
            <span style={{ fontFamily: FONT_HEADING, fontSize: 30, fontWeight: 600, lineHeight: 1.12, color: C.black }}>{p.headline}</span>
          ) : null}
          <StatRow stats={p.stats} color="rgba(26,26,26,0.75)" dotColor={C.tan} size={20} />
          {p.phone ? <span style={{ fontSize: 20, fontWeight: 700, color: C.forest }}>{p.phone}</span> : null}
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          <Photo photoUrl={ph[3] ?? null} />
        </div>
      </div>
    </div>
  );
}

/** Date-forward open-house style card. */
export function FlyerEventTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, textAlign: "center", padding: "40px 60px 22px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.3em", color: C.tan, textTransform: "uppercase" }}>You&apos;re invited</div>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 82, fontWeight: 600, lineHeight: 1, color: C.black, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 10 }}>
          {p.eyebrow}
        </div>
        {p.headline ? <div style={{ fontSize: 27, color: "rgba(26,26,26,0.72)", marginTop: 12 }}>{p.headline}</div> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0, margin: "0 60px", position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "24px 60px 36px", textAlign: "center" }}>
        {p.address ? <div style={{ fontSize: 26, fontWeight: 600, color: C.black }}>{p.address}</div> : null}
        <StatRow stats={p.stats} color="rgba(26,26,26,0.7)" dotColor={C.tan} size={22} />
        <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={21} />
      </div>
    </div>
  );
}

/** Giant address typography with photo window. */
export function FlyerAddressTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.forest, display: "flex", flexDirection: "column", padding: "44px 52px" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Wordmark color={C.cream} size={20} />
        <span style={{ fontSize: 21, fontWeight: 700, letterSpacing: "0.24em", color: C.tan, textTransform: "uppercase" }}>{p.eyebrow}</span>
      </div>
      <div style={{ flexShrink: 0, fontFamily: FONT_HEADING, fontSize: 74, fontWeight: 500, lineHeight: 1.02, color: C.cream, padding: "26px 0 22px" }}>
        {p.address || p.headline || "Your address here"}
      </div>
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 22 }}>
        <StatRow stats={p.stats} color="rgba(242,235,216,0.88)" dotColor={C.tan} size={24} />
        <span style={{ color: C.tan, fontSize: 28, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
      </div>
    </div>
  );
}

/** Twin agent card — two headshots side by side (co-listing team). */
export function FlyerTwinAgentsTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1.8, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            backgroundColor: C.forest,
            color: C.cream,
            fontFamily: FONT_HEADING,
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "12px 40px",
          }}
        >
          {p.eyebrow}
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: "24px 44px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 42, fontWeight: 600, lineHeight: 1.08, color: C.black }}>{p.headline}</div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(26,26,26,0.72)" dotColor={C.tan} size={22} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", gap: 16, padding: "16px 44px 34px" }}>
        <div style={{ flex: 1, backgroundColor: "#f4f1ea", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <Headshot url={p.headshotUrl} name={p.agentName} size={84} ring={C.tan} />
          <ContactStack name={p.agentName} role={p.agentTitle} phone={p.phone} color={C.black} mutedColor="rgba(26,26,26,0.6)" size={23} />
        </div>
        <div style={{ flex: 1, backgroundColor: "#f4f1ea", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <Headshot url={p.partnerHeadshotUrl} name={p.partnerName || "Partner"} size={84} ring={C.sage} />
          <ContactStack name={p.partnerName || "Co-Agent"} role={p.partnerRole} phone={p.partnerPhone} color={C.black} mutedColor="rgba(26,26,26,0.6)" size={23} />
        </div>
      </div>
    </div>
  );
}
