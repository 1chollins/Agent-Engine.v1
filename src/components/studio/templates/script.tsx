import {
  C,
  ContactStack,
  CtaPill,
  FONT_HEADING,
  FONT_SCRIPT,
  Headshot,
  Monogram,
  Photo,
  StatRow,
  Wordmark,
  type TemplateProps,
} from "./shared";

function scriptEyebrow(eyebrow: string): string {
  const t = eyebrow.trim();
  if (!t) return "Just Closed";
  return t
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Clean white, big script headline, photo plate, dual-contact footer. */
export function ScriptClosedTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#fdfcf9", display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, textAlign: "center", padding: "42px 60px 8px" }}>
        <div style={{ fontFamily: FONT_SCRIPT, fontSize: 96, lineHeight: 1, color: C.black }}>{scriptEyebrow(p.eyebrow)}</div>
        {p.partnerName ? (
          <div style={{ display: "inline-block", borderTop: `2px solid ${C.black}`, marginTop: 16, paddingTop: 8, fontFamily: FONT_HEADING, fontSize: 30, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.black }}>
            {p.partnerName}
          </div>
        ) : null}
        {p.address ? <div style={{ fontSize: 25, color: "rgba(26,26,26,0.75)", marginTop: 12 }}>{p.address}</div> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0, margin: "20px 64px", position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "8px 64px 40px", gap: 20 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
          <Headshot url={p.headshotUrl} name={p.agentName} size={92} ring="#e2ddd0" />
          <ContactStack name={p.agentName} role={p.agentTitle} phone={p.phone} color={C.black} mutedColor="rgba(26,26,26,0.6)" size={24} />
        </div>
        <div style={{ width: 2, alignSelf: "stretch", backgroundColor: "rgba(26,26,26,0.18)" }} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16, justifyContent: "flex-end", textAlign: "right" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: C.black }}>{p.partnerName || "Partner / Title Co."}</span>
            {p.partnerRole ? <span style={{ fontSize: 19, color: "rgba(26,26,26,0.6)" }}>{p.partnerRole}</span> : null}
            {p.partnerPhone ? <span style={{ fontSize: 20, color: "rgba(26,26,26,0.6)" }}>{p.partnerPhone}</span> : null}
          </div>
          <Headshot url={p.partnerHeadshotUrl} name={p.partnerName || "P"} size={92} ring="#e2ddd0" />
        </div>
      </div>
    </div>
  );
}

/** Script headline over a tilted polaroid photo. */
export function ScriptPolaroidTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ flexShrink: 0, fontFamily: FONT_SCRIPT, fontSize: 90, lineHeight: 1.05, color: C.forest, padding: "48px 60px 6px", textAlign: "center" }}>
        {scriptEyebrow(p.eyebrow)}
      </div>
      {p.headline ? (
        <div style={{ fontSize: 26, color: "rgba(26,26,26,0.7)", padding: "0 80px", textAlign: "center" }}>{p.headline}</div>
      ) : null}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          alignSelf: "stretch",
          margin: "30px 90px 26px",
          backgroundColor: "#ffffff",
          padding: "18px 18px 60px",
          transform: "rotate(-1.6deg)",
          boxShadow: "0 22px 55px rgba(26,26,26,0.22)",
          display: "flex",
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <Photo photoUrl={p.photoUrl} />
        </div>
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBottom: 40 }}>
        <StatRow stats={p.stats} color={C.black} dotColor={C.tan} size={23} />
        <span style={{ fontSize: 20, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(26,26,26,0.55)" }}>
          {p.agentName ? `${p.agentName} · ` : ""}{p.website || "frameandformstudio.com"}
        </span>
      </div>
    </div>
  );
}

/** Script over the photo itself with soft white glow. */
export function ScriptOverPhotoTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(253,252,249,0.88) 0%, rgba(253,252,249,0.35) 26%, rgba(253,252,249,0) 44%)" }} />
      <div style={{ position: "absolute", top: 44, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: FONT_SCRIPT, fontSize: 100, lineHeight: 1, color: C.forest, textShadow: "0 2px 18px rgba(253,252,249,0.9)" }}>
          {scriptEyebrow(p.eyebrow)}
        </div>
        {p.address ? (
          <div style={{ fontSize: 25, fontWeight: 600, color: C.black, marginTop: 10, textShadow: "0 1px 10px rgba(253,252,249,0.9)" }}>{p.address}</div>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(to top, rgba(26,26,26,0.85), rgba(26,26,26,0))",
          padding: "110px 56px 42px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <StatRow stats={p.stats} color="rgba(242,235,216,0.92)" dotColor={C.tan} size={24} />
        <CtaPill cta={p.cta} bg={C.tan} fg={C.forest} size={21} />
      </div>
    </>
  );
}

/** Note-card: script headline inside a bordered cream card, photo behind. */
export function ScriptNoteTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(26,26,26,0.32)" }} />
      <div
        style={{
          position: "absolute",
          left: "10%",
          right: "10%",
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: C.cream,
          border: `2px solid ${C.tan}`,
          padding: "44px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          textAlign: "center",
          boxShadow: "0 26px 60px rgba(26,26,26,0.4)",
        }}
      >
        <Monogram size={54} />
        <div style={{ fontFamily: FONT_SCRIPT, fontSize: 78, lineHeight: 1.05, color: C.forest }}>{scriptEyebrow(p.eyebrow)}</div>
        {p.headline ? <div style={{ fontSize: 25, lineHeight: 1.4, color: "rgba(26,26,26,0.75)" }}>{p.headline}</div> : null}
        <StatRow stats={p.stats} color={C.black} dotColor={C.tan} size={22} />
        {p.agentName || p.phone ? (
          <div style={{ fontSize: 20, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(26,26,26,0.6)", marginTop: 4 }}>
            {p.agentName}{p.phone ? ` · ${p.phone}` : ""}
          </div>
        ) : null}
      </div>
    </>
  );
}

/** White script band between two photo bands. */
export function ScriptBannerTemplate(p: TemplateProps) {
  const second = p.photos[1] ?? p.photoUrl;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1.15, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, backgroundColor: "#fdfcf9", padding: "26px 52px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <div style={{ fontFamily: FONT_SCRIPT, fontSize: 72, lineHeight: 1, color: C.black }}>{scriptEyebrow(p.eyebrow)}</div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          {p.address ? <span style={{ fontSize: 24, fontWeight: 600, color: C.black }}>{p.address}</span> : null}
          <StatRow stats={p.stats} color="rgba(26,26,26,0.65)" dotColor={C.tan} size={20} />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={second} />
      </div>
    </div>
  );
}

/** Arched photo with script headline beneath — soft celebration. */
export function ScriptArchTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#f6f1e6", display: "flex", flexDirection: "column", alignItems: "center", padding: "44px 70px 38px" }}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          alignSelf: "stretch",
          borderRadius: "50% 50% 18px 18px / 32% 32% 18px 18px",
          overflow: "hidden",
          border: `3px solid ${C.tan}`,
          position: "relative",
        }}
      >
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, fontFamily: FONT_SCRIPT, fontSize: 84, lineHeight: 1.1, color: C.forest, marginTop: 18 }}>
        {scriptEyebrow(p.eyebrow)}
      </div>
      {p.headline ? (
        <div style={{ fontSize: 24, lineHeight: 1.4, color: "rgba(26,26,26,0.7)", textAlign: "center", maxWidth: "84%" }}>{p.headline}</div>
      ) : null}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 18, marginTop: 16 }}>
        <Wordmark color={C.forest} size={19} />
        {p.phone ? <span style={{ fontSize: 20, color: "rgba(26,26,26,0.65)" }}>· {p.phone}</span> : null}
      </div>
    </div>
  );
}
