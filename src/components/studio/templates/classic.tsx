import {
  C,
  CtaPill,
  Eyebrow,
  FONT_HEADING,
  Monogram,
  Photo,
  priceLine,
  StatRow,
  Wordmark,
  type TemplateProps,
} from "./shared";

/** Premium full-bleed: photo fills, dark gradient bottom, copy reversed-out. */
export function OverlayTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(26,26,26,0.92) 0%, rgba(26,26,26,0.72) 28%, rgba(26,26,26,0.12) 52%, rgba(26,26,26,0) 70%)",
        }}
      />
      <div style={{ position: "absolute", top: 56, left: 56, right: 56, display: "flex", alignItems: "center", gap: 18 }}>
        <Monogram size={56} />
        <Wordmark color={C.cream} size={22} />
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 64, display: "flex", flexDirection: "column", gap: 20 }}>
        <Eyebrow text={p.eyebrow} />
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 74, fontWeight: 500, lineHeight: 1.02, color: C.cream }}>
            {p.headline}
          </div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(242,235,216,0.92)" dotColor={C.tan} />
        {p.features.length > 0 ? (
          <div style={{ fontSize: 25, lineHeight: 1.4, color: "rgba(242,235,216,0.7)" }}>{p.features.join("  ·  ")}</div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginTop: 8 }}>
          <div style={{ color: C.tan, fontSize: 34, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</div>
          <CtaPill cta={p.cta} bg={C.tan} fg={C.forest} />
        </div>
      </div>
    </>
  );
}

/** Photo on top, cream editorial panel below. Clip-proof: panel never shrinks. */
export function EditorialTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          flexShrink: 0,
          backgroundColor: C.cream,
          padding: "52px 64px 56px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <Eyebrow text={p.eyebrow} />
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 62, fontWeight: 500, lineHeight: 1.03, color: C.black }}>
            {p.headline}
          </div>
        ) : null}
        <StatRow stats={p.stats} color={C.black} dotColor={C.tan} />
        {p.features.length > 0 ? (
          <div style={{ fontSize: 25, lineHeight: 1.4, color: "rgba(26,26,26,0.6)" }}>{p.features.join("  ·  ")}</div>
        ) : null}
        <div style={{ height: 1, backgroundColor: "rgba(61,74,47,0.2)", marginTop: 4 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div style={{ color: C.tan, fontSize: 32, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</div>
          <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
          <Monogram size={40} bg={C.forest} />
          <Wordmark color={C.black} size={18} />
        </div>
      </div>
    </>
  );
}

/** Luxury minimal: airy cream, windowed photo, restrained type. For Estate listings. */
export function MinimalTemplate(p: TemplateProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.cream,
        padding: "64px 64px 56px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: C.tan, fontSize: 22, fontWeight: 600, letterSpacing: "0.34em", textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
        <Monogram size={48} bg={C.forest} />
      </div>
      <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative", overflow: "hidden" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, alignItems: "center", textAlign: "center" }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 56, fontWeight: 500, lineHeight: 1.05, color: C.black }}>
            {p.headline}
          </div>
        ) : null}
        <div style={{ width: 60, height: 2, backgroundColor: C.tan }} />
        <StatRow stats={p.stats} color="rgba(26,26,26,0.7)" dotColor={C.tan} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 4 }}>
          <span style={{ color: C.tan, fontSize: 30, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
          {p.cta ? (
            <>
              <span style={{ color: "rgba(26,26,26,0.3)" }}>|</span>
              <span style={{ color: C.forest, fontSize: 24, fontWeight: 600 }}>{p.cta}</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Announcement: full-bleed photo + bold status stamp. Built for Just Sold / Open House. */
export function BannerTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(26,26,26,0.55) 0%, rgba(26,26,26,0) 26%, rgba(26,26,26,0) 50%, rgba(26,26,26,0.9) 100%)",
        }}
      />
      <div style={{ position: "absolute", top: 52, left: 56, right: 56, display: "flex", alignItems: "center", gap: 16 }}>
        <Monogram size={52} />
        <Wordmark color={C.cream} size={20} />
      </div>
      {p.eyebrow ? (
        <div style={{ position: "absolute", top: "33%", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              backgroundColor: C.tan,
              color: C.forest,
              fontFamily: FONT_HEADING,
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "14px 52px",
              boxShadow: "0 18px 40px rgba(26,26,26,0.35)",
            }}
          >
            {p.eyebrow}
          </div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 64, display: "flex", flexDirection: "column", gap: 16 }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 60, fontWeight: 500, lineHeight: 1.03, color: C.cream }}>
            {p.headline}
          </div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(242,235,216,0.92)" dotColor={C.tan} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginTop: 6 }}>
          <div style={{ color: C.tan, fontSize: 34, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</div>
          <CtaPill cta={p.cta} bg={C.cream} fg={C.forest} />
        </div>
      </div>
    </>
  );
}
