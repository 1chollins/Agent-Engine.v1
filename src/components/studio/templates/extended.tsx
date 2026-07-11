import {
  C,
  CtaPill,
  Eyebrow,
  FONT_HEADING,
  Headshot,
  Monogram,
  Photo,
  priceLine,
  StatChips,
  StatRow,
  Wordmark,
  type TemplateProps,
} from "./shared";

/* ------------------------------------------------------------- Classic + */

/** Forest top bar, photo middle, cream info footer. */
export function TopBarTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, backgroundColor: C.forest, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Monogram size={46} />
          <Wordmark color={C.cream} size={17} />
        </div>
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.22em", color: C.tan, textTransform: "uppercase" }}>{p.eyebrow}</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, backgroundColor: C.cream, padding: "24px 48px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div style={{ minWidth: 0 }}>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 42, fontWeight: 600, lineHeight: 1.08, color: C.black }}>{p.headline}</div>
          ) : null}
          <StatRow stats={p.stats} color="rgba(26,26,26,0.72)" dotColor={C.tan} size={21} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span style={{ color: C.forest, fontSize: 27, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
          <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={18} />
        </div>
      </div>
    </div>
  );
}

/** Tan side stripe with vertical eyebrow, photo fills the rest. */
export function SideStripeTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      <div style={{ width: 110, backgroundColor: C.tan, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "30px 0" }}>
        <Monogram size={52} bg={C.forest} />
        <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 26, fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", color: C.forest }}>
          {p.eyebrow}
        </span>
        <span style={{ width: 3, height: 60, backgroundColor: C.forest }} />
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "linear-gradient(to top, rgba(26,26,26,0.85), rgba(26,26,26,0))", padding: "100px 44px 36px", display: "flex", flexDirection: "column", gap: 12 }}>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 52, fontWeight: 500, lineHeight: 1.05, color: C.cream }}>{p.headline}</div>
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

/** Symmetric centered serif layout, photo in a wide plate. */
export function CenteredSerifTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#fdfcf9", display: "flex", flexDirection: "column", alignItems: "center", padding: "46px 60px 38px", textAlign: "center" }}>
      <Eyebrow text={p.eyebrow} color={C.forest} />
      {p.headline ? (
        <div style={{ fontFamily: FONT_HEADING, fontSize: 58, fontWeight: 500, lineHeight: 1.06, color: C.black, marginTop: 16, maxWidth: "88%" }}>{p.headline}</div>
      ) : null}
      <div style={{ flex: 1, minHeight: 0, alignSelf: "stretch", marginTop: 24, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 22 }}>
        <StatRow stats={p.stats} color={C.black} dotColor={C.tan} size={23} />
        <div style={{ fontSize: 20, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(26,26,26,0.55)" }}>
          {p.agentName ? `${p.agentName} · ` : ""}{p.phone || p.website || ""}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Bold + */

/** Stacked color blocks: tan eyebrow block, photo, forest CTA block. */
export function BlockStackTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, backgroundColor: C.tan, padding: "26px 52px" }}>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 66, fontWeight: 600, lineHeight: 1, color: C.forest, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {p.eyebrow}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, backgroundColor: C.forest, padding: "24px 52px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div style={{ minWidth: 0 }}>
          {p.headline ? <div style={{ fontSize: 28, fontWeight: 700, color: C.cream, lineHeight: 1.2 }}>{p.headline}</div> : null}
          <StatRow stats={p.stats} color="rgba(242,235,216,0.8)" dotColor={C.tan} size={20} />
        </div>
        <CtaPill cta={p.cta} bg={C.cream} fg={C.forest} size={20} />
      </div>
    </div>
  );
}

/** Photo pair with hard punch overlay between. */
export function PhotoPunchTemplate(p: TemplateProps) {
  const second = p.photos[1] ?? p.photoUrl;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Photo photoUrl={p.photoUrl} />
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          <Photo photoUrl={second} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-3deg)",
          backgroundColor: C.black,
          color: C.cream,
          fontFamily: FONT_HEADING,
          fontSize: 74,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "20px 54px",
          whiteSpace: "nowrap",
          boxShadow: "0 24px 55px rgba(26,26,26,0.5)",
        }}
      >
        {p.eyebrow}
      </div>
      <div style={{ flexShrink: 0, backgroundColor: C.cream, padding: "20px 48px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <StatRow stats={p.stats} color={C.black} dotColor={C.tan} size={23} />
        <span style={{ color: C.forest, fontSize: 27, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
      </div>
    </div>
  );
}

/** All-tan canvas, ink type, photo cut into the corner. */
export function TanCanvasTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.tan, padding: "50px 54px", display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, fontFamily: FONT_HEADING, fontSize: 96, fontWeight: 600, lineHeight: 0.98, color: C.forest, textTransform: "uppercase", maxWidth: "80%" }}>
        {p.eyebrow}
      </div>
      {p.headline ? (
        <div style={{ flexShrink: 0, fontSize: 28, lineHeight: 1.4, color: "rgba(61,74,47,0.85)", marginTop: 16, maxWidth: "70%" }}>{p.headline}</div>
      ) : null}
      <div style={{ flex: 1, minHeight: 0, marginTop: 24, display: "flex", gap: 22 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14 }}>
          <StatChips stats={p.stats} color={C.forest} borderColor={C.forest} size={20} />
          <div style={{ color: C.forest, fontSize: 30, fontWeight: 800 }}>{priceLine(p.showPrice, p.price)}</div>
          <div style={{ display: "flex" }}>
            <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={20} />
          </div>
        </div>
        <div style={{ flex: 1.25, position: "relative", boxShadow: "0 24px 60px rgba(61,74,47,0.35)" }}>
          <Photo photoUrl={p.photoUrl} />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Soft + */

/** Organic blob-arch photo on blush cream. */
export function BlushArchTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#f6efe3", display: "flex", flexDirection: "column", alignItems: "center", padding: "44px 64px 38px" }}>
      <div style={{ flexShrink: 0, fontSize: 20, fontWeight: 700, letterSpacing: "0.3em", color: C.tan, textTransform: "uppercase" }}>{p.eyebrow}</div>
      {p.headline ? (
        <div style={{ flexShrink: 0, fontFamily: FONT_HEADING, fontSize: 50, fontWeight: 500, lineHeight: 1.08, color: C.black, textAlign: "center", marginTop: 12, maxWidth: "88%" }}>
          {p.headline}
        </div>
      ) : null}
      <div style={{ flex: 1, minHeight: 0, alignSelf: "stretch", marginTop: 22, borderRadius: "46% 54% 48% 52% / 38% 38% 22% 22%", overflow: "hidden", position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 20 }}>
        <StatChips stats={p.stats} color={C.forest} borderColor="rgba(61,74,47,0.4)" size={20} />
        <CtaPill cta={p.cta} bg={C.sage} fg={C.forest} size={20} />
      </div>
    </div>
  );
}

/** Two overlapping soft cards — photo card + info card. */
export function StackedCardsTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "7%", left: "7%", width: "70%", height: "58%", borderRadius: 22, overflow: "hidden", boxShadow: "0 26px 60px rgba(26,26,26,0.22)" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          position: "absolute",
          right: "6%",
          bottom: "7%",
          width: "58%",
          backgroundColor: "#ffffff",
          borderRadius: 22,
          padding: "34px 38px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          boxShadow: "0 26px 60px rgba(26,26,26,0.18)",
        }}
      >
        <Eyebrow text={p.eyebrow} color={C.forest} />
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 44, fontWeight: 500, lineHeight: 1.08, color: C.black }}>{p.headline}</div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(26,26,26,0.72)" dotColor={C.tan} size={21} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <span style={{ color: C.forest, fontSize: 26, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
          <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={18} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 40, right: 48 }}>
        <Monogram size={56} />
      </div>
    </div>
  );
}

/** Hand-drawn dashed frame, friendly and light. */
export function DoodleFrameTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 26, border: `3px dashed ${C.tan}`, borderRadius: 26, backgroundColor: "#fdfcf9", display: "flex", flexDirection: "column", padding: "36px 46px", gap: 16 }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.2em", color: C.forest, textTransform: "uppercase" }}>{p.eyebrow}</span>
        <Monogram size={48} />
      </div>
      <div style={{ flex: 1, minHeight: 0, borderRadius: 18, overflow: "hidden", position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      {p.headline ? (
        <div style={{ flexShrink: 0, fontFamily: FONT_HEADING, fontSize: 44, fontWeight: 500, lineHeight: 1.08, color: C.black }}>{p.headline}</div>
      ) : null}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <StatRow stats={p.stats} color="rgba(26,26,26,0.72)" dotColor={C.tan} size={21} />
        <CtaPill cta={p.cta} bg={C.tan} fg={C.forest} size={19} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Luxury + */

/** Estate masthead: double rules, small caps, generous whitespace. */
export function EstateTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#faf7f0", display: "flex", flexDirection: "column", padding: "44px 62px 40px" }}>
      <div style={{ flexShrink: 0, textAlign: "center", borderTop: `3px double ${C.forest}`, borderBottom: `3px double ${C.forest}`, padding: "16px 0" }}>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 46, fontWeight: 600, letterSpacing: "0.24em", color: C.forest, textTransform: "uppercase" }}>
          {p.eyebrow}
        </div>
      </div>
      {p.headline ? (
        <div style={{ flexShrink: 0, textAlign: "center", fontFamily: FONT_HEADING, fontSize: 40, fontStyle: "italic", color: C.black, marginTop: 18, lineHeight: 1.2 }}>
          {p.headline}
        </div>
      ) : null}
      <div style={{ flex: 1, minHeight: 0, marginTop: 20, position: "relative", border: `1px solid rgba(61,74,47,0.3)`, padding: 10 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, textAlign: "center", marginTop: 18, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        <StatRow stats={p.stats} color={C.forest} dotColor={C.tan} size={22} />
        <div style={{ fontSize: 24, fontWeight: 700, color: C.black }}>{priceLine(p.showPrice, p.price)}</div>
        <div style={{ fontSize: 18, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(26,26,26,0.55)" }}>
          {p.website || "frameandformstudio.com"}
        </div>
      </div>
    </div>
  );
}

/** Charcoal marble mood with gold accents. */
export function NoirGoldTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#221f1c", display: "flex", flexDirection: "column", padding: "48px 56px 42px" }}>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Wordmark color={C.cream} size={19} />
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.28em", color: "#c9a35f", textTransform: "uppercase" }}>{p.eyebrow}</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, marginTop: 26, position: "relative", border: "1px solid rgba(201,163,95,0.5)", padding: 14 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, marginTop: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div style={{ minWidth: 0 }}>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 46, fontWeight: 500, lineHeight: 1.08, color: C.cream }}>{p.headline}</div>
          ) : null}
          <StatRow stats={p.stats} color="rgba(242,235,216,0.72)" dotColor="#c9a35f" size={21} />
        </div>
        <div style={{ color: "#c9a35f", fontSize: 30, fontWeight: 700, whiteSpace: "nowrap" }}>{priceLine(p.showPrice, p.price)}</div>
      </div>
    </div>
  );
}

/** Twin vertical photo panels in thin frames. */
export function GalleryPairTemplate(p: TemplateProps) {
  const second = p.photos[1] ?? p.photoUrl;
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column", padding: "46px 56px 40px" }}>
      <div style={{ flexShrink: 0, textAlign: "center" }}>
        <Eyebrow text={p.eyebrow} color={C.forest} />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 24, marginTop: 22 }}>
        {[p.photoUrl, second].map((ph, i) => (
          <div key={i} style={{ flex: 1, border: `1px solid ${C.forest}`, padding: 12, position: "relative", display: "flex" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Photo photoUrl={ph} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ flexShrink: 0, textAlign: "center", marginTop: 22, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 42, fontWeight: 500, lineHeight: 1.1, color: C.black }}>{p.headline}</div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(26,26,26,0.7)" dotColor={C.tan} size={21} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Playful + */

/** Torn-paper zigzag divider between photo and copy. */
export function TornEdgeTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1.5, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          flexShrink: 0,
          backgroundColor: C.cream,
          clipPath: "polygon(0 26px, 4% 0, 9% 26px, 14% 2px, 19% 24px, 25% 0, 31% 26px, 37% 4px, 43% 22px, 50% 0, 57% 24px, 63% 2px, 69% 26px, 75% 0, 81% 24px, 87% 3px, 93% 26px, 98% 0, 100% 22px, 100% 100%, 0 100%)",
          marginTop: -28,
          padding: "48px 52px 34px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span style={{ backgroundColor: C.forest, color: C.cream, fontSize: 24, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "10px 24px", borderRadius: 8, transform: "rotate(-1.5deg)" }}>
            {p.eyebrow}
          </span>
          <span style={{ color: C.forest, fontSize: 27, fontWeight: 800 }}>{priceLine(p.showPrice, p.price)}</span>
        </div>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 46, fontWeight: 500, lineHeight: 1.08, color: C.black }}>{p.headline}</div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <StatRow stats={p.stats} color="rgba(26,26,26,0.72)" dotColor={C.tan} size={21} />
          <CtaPill cta={p.cta} bg={C.tan} fg={C.forest} size={19} />
        </div>
      </div>
    </div>
  );
}

/** Corner starburst badge over the photo. */
export function StarburstTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 52,
          right: 52,
          width: 250,
          height: 250,
          backgroundColor: C.tan,
          clipPath:
            "polygon(50% 0%, 59% 12%, 72% 5%, 76% 19%, 91% 17%, 89% 32%, 100% 40%, 92% 51%, 100% 62%, 88% 69%, 91% 84%, 76% 83%, 71% 97%, 59% 89%, 50% 100%, 41% 89%, 29% 97%, 24% 83%, 9% 84%, 12% 69%, 0% 62%, 8% 51%, 0% 40%, 11% 32%, 9% 17%, 24% 19%, 28% 5%, 41% 12%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          transform: "rotate(8deg)",
        }}
      >
        <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", color: C.forest, lineHeight: 1.1, maxWidth: 170 }}>
          {p.eyebrow}
        </span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "linear-gradient(to top, rgba(26,26,26,0.88), rgba(26,26,26,0))", padding: "110px 52px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 54, fontWeight: 500, lineHeight: 1.04, color: C.cream }}>{p.headline}</div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <StatRow stats={p.stats} color="rgba(242,235,216,0.9)" dotColor={C.tan} size={23} />
          <CtaPill cta={p.cta} bg={C.tan} fg={C.forest} size={20} />
        </div>
      </div>
    </>
  );
}

/** Photo-booth strip down the side with playful captions. */
export function BoothStripTemplate(p: TemplateProps) {
  const strip = [p.photoUrl, ...(p.photos.slice(1, 3))];
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.sage, display: "flex" }}>
      <div style={{ width: "34%", backgroundColor: "#ffffff", margin: "40px 0 40px 44px", padding: "16px 16px 26px", display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 22px 55px rgba(26,26,26,0.25)", transform: "rotate(-2deg)" }}>
        {strip.map((s, i) => (
          <div key={i} style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <Photo photoUrl={s ?? null} />
          </div>
        ))}
        <div style={{ textAlign: "center", fontSize: 17, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(26,26,26,0.55)" }}>
          {p.address || "SWFL"}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, padding: "48px 52px" }}>
        <span style={{ alignSelf: "flex-start", backgroundColor: C.forest, color: C.cream, fontSize: 23, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", padding: "10px 24px", borderRadius: 9999 }}>
          {p.eyebrow}
        </span>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 56, fontWeight: 500, lineHeight: 1.05, color: C.cream }}>{p.headline}</div>
        ) : null}
        <StatRow stats={p.stats} color={C.cream} dotColor={C.forest} size={23} />
        <div style={{ display: "flex" }}>
          <CtaPill cta={p.cta} bg={C.cream} fg={C.forest} size={20} />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Marketing + */

/** Full-width price banner splitting photo from copy. */
export function OfferBannerTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1.4, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, backgroundColor: C.tan, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 52px", gap: 20 }}>
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: C.forest }}>{p.eyebrow}</span>
        <span style={{ fontFamily: FONT_HEADING, fontSize: 56, fontWeight: 700, color: C.forest, lineHeight: 1 }}>{priceLine(p.showPrice, p.price)}</span>
      </div>
      <div style={{ flex: 1, backgroundColor: C.cream, padding: "24px 52px 30px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 44, fontWeight: 500, lineHeight: 1.08, color: C.black }}>{p.headline}</div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <StatRow stats={p.stats} color="rgba(26,26,26,0.72)" dotColor={C.tan} size={22} />
          <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={19} />
        </div>
      </div>
    </div>
  );
}

/** Then/Now split with labels — great for reductions and refreshes. */
export function ThenNowTemplate(p: TemplateProps) {
  const second = p.photos[1] ?? p.photoUrl;
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.black, display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, textAlign: "center", padding: "26px 40px 18px" }}>
        <span style={{ fontFamily: FONT_HEADING, fontSize: 52, fontWeight: 600, color: C.cream, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {p.eyebrow}
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 8, padding: "0 40px" }}>
        {[
          { ph: p.photoUrl, label: "Before" },
          { ph: second, label: "Now" },
        ].map((x, i) => (
          <div key={i} style={{ flex: 1, position: "relative" }}>
            <Photo photoUrl={x.ph} />
            <span style={{ position: "absolute", top: 16, left: 16, backgroundColor: i === 0 ? "rgba(26,26,26,0.8)" : C.tan, color: i === 0 ? C.cream : C.forest, fontSize: 21, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "8px 18px" }}>
              {x.label}
            </span>
          </div>
        ))}
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 40px 28px", gap: 18 }}>
        <div style={{ minWidth: 0 }}>
          {p.headline ? <div style={{ fontSize: 27, fontWeight: 700, color: C.cream, lineHeight: 1.25 }}>{p.headline}</div> : null}
          <StatRow stats={p.stats} color="rgba(242,235,216,0.72)" dotColor={C.tan} size={20} />
        </div>
        <span style={{ color: C.tan, fontSize: 34, fontWeight: 800, whiteSpace: "nowrap" }}>{priceLine(p.showPrice, p.price)}</span>
      </div>
    </div>
  );
}

/** Website spotlight — big URL plate for traffic-driving posts. */
export function LinkSpotTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(61,74,47,0.62)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "0 56px", textAlign: "center" }}>
        <Eyebrow text={p.eyebrow} />
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 62, fontWeight: 500, lineHeight: 1.08, color: C.cream, maxWidth: "88%" }}>{p.headline}</div>
        ) : null}
        <div style={{ backgroundColor: C.cream, color: C.forest, fontSize: 30, fontWeight: 800, padding: "20px 46px", borderRadius: 14, boxShadow: "0 20px 50px rgba(26,26,26,0.4)" }}>
          {p.website || "frameandformstudio.com"}
        </div>
        <StatRow stats={p.stats} color="rgba(242,235,216,0.85)" dotColor={C.tan} size={22} />
      </div>
    </>
  );
}

/** Feature columns under a wide photo — spec-sheet energy. */
export function SpecSheetTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1.3, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
        <div style={{ position: "absolute", left: 44, bottom: 0, transform: "translateY(50%)", backgroundColor: C.forest, color: C.cream, fontFamily: FONT_HEADING, fontSize: 40, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "14px 34px" }}>
          {p.eyebrow}
        </div>
      </div>
      <div style={{ flex: 1, padding: "56px 44px 30px", display: "flex", flexDirection: "column", gap: 16 }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 42, fontWeight: 600, lineHeight: 1.08, color: C.black }}>{p.headline}</div>
        ) : null}
        <div style={{ display: "flex", gap: 20 }}>
          {p.stats.slice(0, 4).map((s, i) => (
            <div key={i} style={{ flex: 1, borderTop: `3px solid ${C.tan}`, paddingTop: 10 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.black }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: "auto" }}>
          <span style={{ fontSize: 21, color: "rgba(26,26,26,0.6)" }}>{p.agentName}{p.phone ? ` · ${p.phone}` : ""}</span>
          <span style={{ color: C.forest, fontSize: 28, fontWeight: 800 }}>{priceLine(p.showPrice, p.price)}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Showcase + */

/** Horizontal film strip of four frames across the middle. */
export function FilmStripTemplate(p: TemplateProps) {
  const frames = [p.photoUrl, ...p.photos.slice(1, 4)];
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.black, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26, padding: "44px 0" }}>
      <div style={{ textAlign: "center", padding: "0 60px" }}>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 64, fontWeight: 600, color: C.cream, textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: 1.05 }}>
          {p.eyebrow}
        </div>
        {p.headline ? <div style={{ fontSize: 24, color: "rgba(242,235,216,0.7)", marginTop: 10 }}>{p.headline}</div> : null}
      </div>
      <div style={{ backgroundColor: "#111", padding: "22px 0", display: "flex", gap: 14, borderTop: "6px dashed rgba(242,235,216,0.35)", borderBottom: "6px dashed rgba(242,235,216,0.35)" }}>
        {frames.map((f, i) => (
          <div key={i} style={{ flex: 1, aspectRatio: "1 / 1", position: "relative", minWidth: 0 }}>
            <Photo photoUrl={f ?? null} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 26, padding: "0 60px" }}>
        <StatRow stats={p.stats} color="rgba(242,235,216,0.85)" dotColor={C.tan} size={22} />
        <CtaPill cta={p.cta} bg={C.tan} fg={C.forest} size={19} />
      </div>
    </div>
  );
}

/** Three horizontal photo bands with a floating title plate. */
export function TripleBandTemplate(p: TemplateProps) {
  const bands = [p.photoUrl, p.photos[1] ?? p.photoUrl, p.photos[2] ?? p.photoUrl];
  return (
    <>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 6, backgroundColor: C.cream }}>
        {bands.map((b, i) => (
          <div key={i} style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <Photo photoUrl={b} />
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(242,235,216,0.97)",
          padding: "30px 44px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "center",
          boxShadow: "0 26px 60px rgba(26,26,26,0.35)",
          maxWidth: "76%",
        }}
      >
        <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "0.26em", color: C.tan, textTransform: "uppercase" }}>{p.eyebrow}</span>
        {p.headline ? (
          <span style={{ fontFamily: FONT_HEADING, fontSize: 44, fontWeight: 600, lineHeight: 1.1, color: C.black }}>{p.headline}</span>
        ) : null}
        <StatRow stats={p.stats} color="rgba(26,26,26,0.7)" dotColor={C.tan} size={20} />
      </div>
    </>
  );
}

/** Mosaic of five photos with copy tile. */
export function MosaicFiveTemplate(p: TemplateProps) {
  const ph = [p.photoUrl, ...p.photos.slice(1, 4)];
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.forest, display: "flex", gap: 10, padding: 36 }}>
      <div style={{ flex: 1.5, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ flex: 1.6, minHeight: 0, position: "relative" }}>
          <Photo photoUrl={ph[0] ?? null} />
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Photo photoUrl={ph[1] ?? null} />
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <Photo photoUrl={ph[2] ?? null} />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <Photo photoUrl={ph[3] ?? null} />
        </div>
        <div style={{ flex: 1.2, backgroundColor: C.cream, padding: "24px 26px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.22em", color: C.tan, textTransform: "uppercase" }}>{p.eyebrow}</span>
          {p.headline ? (
            <span style={{ fontFamily: FONT_HEADING, fontSize: 34, fontWeight: 600, lineHeight: 1.12, color: C.black }}>{p.headline}</span>
          ) : null}
          <StatRow stats={p.stats} color="rgba(26,26,26,0.72)" dotColor={C.tan} size={19} />
          <span style={{ color: C.forest, fontSize: 24, fontWeight: 800 }}>{priceLine(p.showPrice, p.price)}</span>
        </div>
      </div>
    </div>
  );
}

/** Agent headshot rail + big photo — listing with a face. */
export function HostedByTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
        <div style={{ position: "absolute", top: 40, left: 48, backgroundColor: "rgba(242,235,216,0.95)", color: C.forest, fontSize: 23, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", padding: "12px 26px" }}>
          {p.eyebrow}
        </div>
      </div>
      <div style={{ flexShrink: 0, backgroundColor: C.cream, display: "flex", alignItems: "center", gap: 22, padding: "22px 48px 26px" }}>
        <Headshot url={p.headshotUrl} name={p.agentName} size={104} ring={C.tan} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "0.2em", color: C.tan, textTransform: "uppercase" }}>Hosted by</div>
          <div style={{ fontFamily: FONT_HEADING, fontSize: 36, fontWeight: 600, color: C.black, lineHeight: 1.05 }}>{p.agentName || "Your Name"}</div>
          <div style={{ fontSize: 19, color: "rgba(26,26,26,0.62)" }}>
            {p.agentTitle}{p.phone ? ` · ${p.phone}` : ""}
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          {p.headline ? <div style={{ fontSize: 24, fontWeight: 700, color: C.black, maxWidth: 420, lineHeight: 1.25 }}>{p.headline}</div> : null}
          <StatRow stats={p.stats} color="rgba(26,26,26,0.7)" dotColor={C.tan} size={19} />
        </div>
      </div>
    </div>
  );
}
