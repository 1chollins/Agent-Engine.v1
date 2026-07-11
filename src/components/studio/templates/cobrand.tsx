import {
  C,
  ContactStack,
  FONT_HEADING,
  FONT_SCRIPT,
  Headshot,
  Monogram,
  Photo,
  StatRow,
  type TemplateProps,
} from "./shared";

/** Split contact bar: agent left, partner right, divider between. */
export function CoBrandBarTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
        <div
          style={{
            position: "absolute",
            top: 44,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(26,26,26,0.78)",
            color: C.cream,
            fontFamily: FONT_HEADING,
            fontSize: 46,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "14px 44px",
            whiteSpace: "nowrap",
          }}
        >
          {p.eyebrow}
        </div>
        {p.address ? (
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(242,235,216,0.94)",
              color: C.black,
              fontSize: 23,
              fontWeight: 600,
              padding: "10px 26px",
              borderRadius: 9999,
              whiteSpace: "nowrap",
            }}
          >
            {p.address}
          </div>
        ) : null}
      </div>
      <div style={{ flexShrink: 0, backgroundColor: C.forest, display: "flex", alignItems: "stretch" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 18, padding: "22px 36px" }}>
          <Headshot url={p.headshotUrl} name={p.agentName} size={92} ring={C.tan} />
          <ContactStack name={p.agentName} role={p.agentTitle} phone={p.phone} color={C.cream} mutedColor="rgba(242,235,216,0.7)" size={25} />
        </div>
        <div style={{ width: 2, backgroundColor: "rgba(242,235,216,0.25)", margin: "18px 0" }} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 18, padding: "22px 36px", justifyContent: "flex-end", textAlign: "right" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            <span style={{ fontSize: 25, fontWeight: 700, color: C.cream }}>{p.partnerName || "Partner"}</span>
            {p.partnerRole ? <span style={{ fontSize: 19, color: "rgba(242,235,216,0.7)" }}>{p.partnerRole}</span> : null}
            {p.partnerPhone ? <span style={{ fontSize: 20, color: "rgba(242,235,216,0.7)" }}>{p.partnerPhone}</span> : null}
          </div>
          <Headshot url={p.partnerHeadshotUrl} name={p.partnerName || "P"} size={92} ring={C.sage} />
        </div>
      </div>
    </div>
  );
}

/** Photo with two stacked partner cards on the right. */
export function CoBrandStackTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex" }}>
      <div style={{ flex: 1.35, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 0,
            backgroundColor: C.tan,
            color: C.forest,
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "12px 30px",
          }}
        >
          {p.eyebrow}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, padding: "36px 34px" }}>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 40, fontWeight: 600, lineHeight: 1.08, color: C.black }}>{p.headline}</div>
        ) : null}
        <StatRow stats={p.stats} color="rgba(26,26,26,0.72)" dotColor={C.tan} size={20} />
        <div style={{ flex: 1 }} />
        <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, border: "1px solid rgba(61,74,47,0.14)" }}>
          <Headshot url={p.headshotUrl} name={p.agentName} size={72} ring={C.tan} />
          <ContactStack name={p.agentName} role={p.agentTitle} phone={p.phone} color={C.black} mutedColor="rgba(26,26,26,0.6)" size={21} />
        </div>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, border: "1px solid rgba(61,74,47,0.14)" }}>
          <Headshot url={p.partnerHeadshotUrl} name={p.partnerName || "P"} size={72} ring={C.sage} />
          <ContactStack name={p.partnerName || "Partner"} role={p.partnerRole} phone={p.partnerPhone} color={C.black} mutedColor="rgba(26,26,26,0.6)" size={21} />
        </div>
      </div>
    </div>
  );
}

/** Partner names in a tan ribbon beneath the headline. */
export function CoBrandRibbonTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#fdfcf9", display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, textAlign: "center", padding: "40px 60px 0" }}>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 76, fontWeight: 600, lineHeight: 1, color: C.black, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {p.eyebrow}
        </div>
      </div>
      <div style={{ flexShrink: 0, alignSelf: "center", backgroundColor: C.tan, color: C.forest, fontSize: 23, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "10px 36px", marginTop: 18, clipPath: "polygon(3% 0, 97% 0, 100% 50%, 97% 100%, 3% 100%, 0 50%)" }}>
        {p.agentName || "Agent"}{p.partnerName ? `  ×  ${p.partnerName}` : ""}
      </div>
      {p.address ? (
        <div style={{ flexShrink: 0, textAlign: "center", fontSize: 24, color: "rgba(26,26,26,0.7)", marginTop: 14 }}>{p.address}</div>
      ) : null}
      <div style={{ flex: 1, minHeight: 0, margin: "24px 60px 30px", position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", gap: 40, paddingBottom: 36, fontSize: 21, color: "rgba(26,26,26,0.68)" }}>
        {p.phone ? <span>{p.phone}</span> : null}
        {p.partnerPhone ? <span>{p.partnerPhone}</span> : null}
        {p.website ? <span>{p.website}</span> : null}
      </div>
    </div>
  );
}

/** Two circle headshots flanking a centered address block. */
export function CoBrandCirclesTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1.6, minHeight: 0, position: "relative" }}>
        <Photo photoUrl={p.photoUrl} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(26,26,26,0.42), rgba(26,26,26,0) 40%)" }} />
        <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center" }}>
          <span style={{ fontFamily: FONT_SCRIPT, fontSize: 84, color: C.cream, textShadow: "0 4px 24px rgba(26,26,26,0.6)" }}>
            {(p.eyebrow || "Just Closed").toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          </span>
        </div>
      </div>
      <div style={{ flexShrink: 0, backgroundColor: C.cream, padding: "26px 52px 34px", display: "flex", alignItems: "center", gap: 24 }}>
        <Headshot url={p.headshotUrl} name={p.agentName} size={118} ring={C.tan} />
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          {p.address ? <div style={{ fontSize: 27, fontWeight: 700, color: C.black, lineHeight: 1.25 }}>{p.address}</div> : null}
          <div style={{ fontSize: 20, color: "rgba(26,26,26,0.65)", marginTop: 8 }}>
            {p.agentName}{p.phone ? ` · ${p.phone}` : ""}
          </div>
          {p.partnerName ? (
            <div style={{ fontSize: 20, color: "rgba(26,26,26,0.65)", marginTop: 2 }}>
              {p.partnerName}{p.partnerPhone ? ` · ${p.partnerPhone}` : ""}
            </div>
          ) : null}
        </div>
        <Headshot url={p.partnerHeadshotUrl} name={p.partnerName || "P"} size={118} ring={C.sage} />
      </div>
    </div>
  );
}

/** Thank-you note style with both parties signed. */
export function CoBrandThanksTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.forest, display: "flex", flexDirection: "column", padding: "48px 56px 40px" }}>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Monogram size={54} />
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.24em", color: C.tan, textTransform: "uppercase" }}>{p.eyebrow}</span>
      </div>
      <div style={{ flexShrink: 0, fontFamily: FONT_SCRIPT, fontSize: 92, color: C.cream, lineHeight: 1.05, marginTop: 20 }}>Thank you</div>
      <div style={{ flexShrink: 0, fontSize: 25, lineHeight: 1.5, color: "rgba(242,235,216,0.82)", maxWidth: "86%", marginTop: 8 }}>
        {p.headline || "To our incredible clients and partners — congratulations on a smooth closing."}
      </div>
      <div style={{ flex: 1, minHeight: 0, marginTop: 24, position: "relative", borderRadius: 14, overflow: "hidden" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Headshot url={p.headshotUrl} name={p.agentName} size={76} ring={C.tan} />
          <div>
            <div style={{ fontSize: 23, fontWeight: 700, color: C.cream }}>{p.agentName || "Agent"}</div>
            <div style={{ fontSize: 18, color: "rgba(242,235,216,0.66)" }}>{p.agentTitle}</div>
          </div>
        </div>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 34, color: C.tan }}>×</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "right" }}>
          <div>
            <div style={{ fontSize: 23, fontWeight: 700, color: C.cream }}>{p.partnerName || "Partner"}</div>
            <div style={{ fontSize: 18, color: "rgba(242,235,216,0.66)" }}>{p.partnerRole}</div>
          </div>
          <Headshot url={p.partnerHeadshotUrl} name={p.partnerName || "P"} size={76} ring={C.sage} />
        </div>
      </div>
    </div>
  );
}

/** Logo-line closing card — partner brand gets top billing. */
export function CoBrandMastheadTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, textAlign: "center", padding: "38px 60px 6px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 22 }}>
          <span style={{ fontFamily: FONT_HEADING, fontSize: 34, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.black }}>
            {p.partnerName || "Partner Co."}
          </span>
          <span style={{ width: 2, height: 40, backgroundColor: C.tan }} />
          <span style={{ fontFamily: FONT_HEADING, fontSize: 34, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.black }}>
            Frame &amp; Form
          </span>
        </div>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 72, fontWeight: 600, color: C.forest, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 14, lineHeight: 1 }}>
          {p.eyebrow}
        </div>
        {p.address ? <div style={{ fontSize: 23, color: "rgba(26,26,26,0.7)", marginTop: 10 }}>{p.address}</div> : null}
      </div>
      <div style={{ flex: 1, minHeight: 0, margin: "20px 56px", position: "relative", border: `1px solid rgba(26,26,26,0.16)` }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", gap: 46, padding: "0 56px 34px", fontSize: 21, color: "rgba(26,26,26,0.7)" }}>
        <span><b style={{ color: C.black }}>{p.agentName}</b>{p.phone ? ` · ${p.phone}` : ""}</span>
        {p.partnerName ? <span><b style={{ color: C.black }}>{p.partnerName}</b>{p.partnerPhone ? ` · ${p.partnerPhone}` : ""}</span> : null}
      </div>
    </div>
  );
}
