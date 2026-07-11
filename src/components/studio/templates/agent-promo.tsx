import {
  C,
  CtaPill,
  FONT_HEADING,
  FONT_SCRIPT,
  Headshot,
  Monogram,
  Photo,
  StatChips,
  Wordmark,
  type TemplateProps,
} from "./shared";

const gold = "#b9975d";
const luxeCream = "#f4efe4";

function splitService(s: string): { label: string; desc: string } {
  const idx = s.indexOf("—") >= 0 ? s.indexOf("—") : s.indexOf(" - ");
  if (idx > 0) return { label: s.slice(0, idx).trim(), desc: s.slice(idx + 1).replace(/^-\s*/, "").trim() };
  return { label: s.trim(), desc: "" };
}

function firstName(name: string): string {
  return (name.trim().split(" ")[0] || "Me").toUpperCase();
}

/** Luxe gold intro — “Hi, I'm ___, your local Realtor” with services list. */
export function AgentIntroLuxeTemplate(p: TemplateProps) {
  const services = p.services.slice(0, 4).map(splitService);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: luxeCream, display: "flex", flexDirection: "column", padding: "44px 52px 36px", border: `1px solid ${gold}`, boxShadow: `inset 0 0 0 10px ${luxeCream}, inset 0 0 0 12px ${gold}` }}>
      <div style={{ flexShrink: 0, display: "flex", gap: 28 }}>
        <div style={{ flex: 1.15, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontFamily: FONT_SCRIPT, fontSize: 40, color: gold, lineHeight: 1 }}>Hi, I&apos;m</div>
          <div style={{ fontFamily: FONT_HEADING, fontSize: 100, fontWeight: 600, lineHeight: 0.95, color: C.black, letterSpacing: "0.04em" }}>
            {firstName(p.agentName)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <span style={{ height: 1, width: 42, backgroundColor: gold }} />
            <span style={{ fontSize: 22, letterSpacing: "0.3em", textTransform: "uppercase", color: C.black }}>
              {p.agentTitle || "Your Local Realtor"}
            </span>
            <span style={{ height: 1, width: 42, backgroundColor: gold }} />
          </div>
          {p.tagline ? (
            <div style={{ fontSize: 22, lineHeight: 1.45, color: "rgba(26,26,26,0.75)", marginTop: 10 }}>{p.tagline}</div>
          ) : null}
        </div>
        <div style={{ flex: 1, minHeight: 300, position: "relative", borderRadius: 14, overflow: "hidden", border: `2px solid ${gold}` }}>
          {p.headshotUrl ? <Photo photoUrl={p.headshotUrl} /> : <Photo photoUrl={p.photoUrl} />}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, paddingTop: 24 }}>
        {services.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, border: `2px solid ${C.black}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_HEADING, fontSize: 26, fontWeight: 700, color: C.black, flexShrink: 0 }}>
              {i + 1}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: C.black }}>{s.label}</div>
              {s.desc ? <div style={{ fontSize: 20, color: "rgba(26,26,26,0.65)", lineHeight: 1.3 }}>{s.desc}</div> : null}
            </div>
          </div>
        ))}
      </div>
      <div style={{ flexShrink: 0, borderTop: `1px solid ${gold}`, paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <span style={{ fontFamily: FONT_SCRIPT, fontSize: 30, color: C.black }}>{p.cta || "Let's achieve your real estate goals"}</span>
        {p.socialHandle ? (
          <span style={{ backgroundColor: C.black, color: luxeCream, fontSize: 20, fontWeight: 600, padding: "10px 22px", borderRadius: 9999 }}>
            {p.socialHandle}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** “Your Trustworthy Agent” — benefit pills + Contact Now block. */
export function AgentTrustTemplate(p: TemplateProps) {
  const services = p.services.slice(0, 4).map(splitService);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: luxeCream, display: "flex" }}>
      <div style={{ flex: 1.15, display: "flex", flexDirection: "column", padding: "48px 10px 44px 52px", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Monogram size={50} bg={C.forest} />
          <Wordmark color={C.black} size={17} />
        </div>
        <div style={{ marginTop: 30 }}>
          <div style={{ fontSize: 30, color: C.black }}>Your Trustworthy</div>
          <div style={{ fontFamily: FONT_HEADING, fontSize: 76, fontStyle: "italic", fontWeight: 600, lineHeight: 1, color: gold }}>Real Estate</div>
          <div style={{ fontFamily: FONT_HEADING, fontSize: 84, fontWeight: 600, lineHeight: 1, color: C.forest }}>Agent</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
          {services.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div style={{ width: 56, height: 48, borderRadius: "24px 0 0 24px", backgroundColor: gold, display: "flex", alignItems: "center", justifyContent: "center", color: luxeCream, fontSize: 24, flexShrink: 0 }}>
                →
              </div>
              <div style={{ backgroundColor: C.forest, color: luxeCream, fontSize: 22, padding: "10px 22px", borderRadius: "0 24px 24px 0", lineHeight: 1.25 }}>
                <b>{s.label}</b>
                {s.desc ? ` ${s.desc}` : ""}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto" }}>
          <div style={{ fontFamily: FONT_HEADING, fontSize: 52, fontWeight: 600, color: C.black }}>Contact Now</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {p.email ? <div style={{ fontSize: 22, color: C.black }}><b>EMAIL:</b>&nbsp; {p.email}</div> : null}
            {p.phone ? <div style={{ fontSize: 22, color: C.black }}><b>PHONE:</b>&nbsp; {p.phone}</div> : null}
            {p.website ? <div style={{ fontSize: 22, color: C.black }}><b>WEB:</b>&nbsp; {p.website}</div> : null}
          </div>
        </div>
      </div>
      <div style={{ flex: 0.95, position: "relative" }}>
        <div style={{ position: "absolute", inset: "8% 6% 0 0", borderRadius: "200px 200px 0 0", overflow: "hidden" }}>
          {p.headshotUrl ? <Photo photoUrl={p.headshotUrl} /> : <Photo photoUrl={p.photoUrl} />}
        </div>
      </div>
    </div>
  );
}

/** 2×2 service cards around a center headshot. */
export function AgentServicesGridTemplate(p: TemplateProps) {
  const services = p.services.slice(0, 4).map(splitService);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column", padding: "44px 48px 40px" }}>
      <div style={{ flexShrink: 0, textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.28em", color: C.tan, textTransform: "uppercase" }}>What I do for you</div>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 56, fontWeight: 600, color: C.black, lineHeight: 1.05, marginTop: 8 }}>
          {p.agentName || "Your Name"}
        </div>
        {p.agentTitle ? <div style={{ fontSize: 22, color: "rgba(26,26,26,0.65)", marginTop: 6 }}>{p.agentTitle}</div> : null}
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24, position: "relative" }}>
        {services.map((s, i) => (
          <div key={i} style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 8, border: "1px solid rgba(61,74,47,0.14)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: C.forest, color: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>
              {i + 1}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.black, lineHeight: 1.15 }}>{s.label}</div>
            {s.desc ? <div style={{ fontSize: 19, color: "rgba(26,26,26,0.62)", lineHeight: 1.35 }}>{s.desc}</div> : null}
          </div>
        ))}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
          <Headshot url={p.headshotUrl} name={p.agentName} size={150} ring={C.tan} />
        </div>
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 22 }}>
        <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={21} />
        {p.socialHandle ? <span style={{ fontSize: 21, fontWeight: 700, color: C.forest }}>{p.socialHandle}</span> : null}
      </div>
    </div>
  );
}

/** Centered business-card look. */
export function AgentCardTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(61,74,47,0.55)" }} />
      <div
        style={{
          position: "absolute",
          left: "12%",
          right: "12%",
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: C.cream,
          borderRadius: 20,
          padding: "44px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          textAlign: "center",
          boxShadow: "0 30px 70px rgba(26,26,26,0.45)",
        }}
      >
        <Headshot url={p.headshotUrl} name={p.agentName} size={150} ring={C.tan} />
        <div style={{ fontFamily: FONT_HEADING, fontSize: 52, fontWeight: 600, color: C.black, lineHeight: 1.05, marginTop: 6 }}>
          {p.agentName || "Your Name"}
        </div>
        <div style={{ fontSize: 21, letterSpacing: "0.24em", textTransform: "uppercase", color: C.tan, fontWeight: 700 }}>
          {p.agentTitle || "Realtor"}
        </div>
        {p.tagline ? <div style={{ fontSize: 22, lineHeight: 1.45, color: "rgba(26,26,26,0.72)", maxWidth: "88%" }}>{p.tagline}</div> : null}
        <div style={{ height: 1, alignSelf: "stretch", backgroundColor: "rgba(61,74,47,0.25)", margin: "8px 0" }} />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 22px", fontSize: 21, color: C.forest, fontWeight: 600 }}>
          {p.phone ? <span>{p.phone}</span> : null}
          {p.email ? <span>{p.email}</span> : null}
          {p.website ? <span>{p.website}</span> : null}
          {p.socialHandle ? <span>{p.socialHandle}</span> : null}
        </div>
      </div>
    </>
  );
}

/** Tagline as a big serif quote beside the headshot. */
export function AgentQuoteTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.forest, display: "flex" }}>
      <div style={{ flex: 1.2, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22, padding: "52px 20px 52px 56px" }}>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 150, lineHeight: 0.5, color: C.tan }}>&ldquo;</div>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 47, fontWeight: 500, lineHeight: 1.2, color: C.cream }}>
          {p.tagline || "I help buyers, sellers & investors navigate real estate with confidence."}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: C.tan }}>{p.agentName || "Your Name"}</span>
          <span style={{ fontSize: 20, color: "rgba(242,235,216,0.7)" }}>
            {p.agentTitle || "Realtor"}{p.address ? ` · ${p.address}` : ""}
          </span>
          {p.socialHandle ? <span style={{ fontSize: 21, color: C.cream, fontWeight: 600, marginTop: 8 }}>{p.socialHandle}</span> : null}
        </div>
      </div>
      <div style={{ flex: 0.9, position: "relative", margin: "56px 56px 56px 12px", borderRadius: 18, overflow: "hidden", border: `2px solid ${C.tan}` }}>
        {p.headshotUrl ? <Photo photoUrl={p.headshotUrl} /> : <Photo photoUrl={p.photoUrl} />}
      </div>
    </div>
  );
}

/** Full-bleed headshot with bottom sheet of services (story-friendly). */
export function AgentSpotlightTemplate(p: TemplateProps) {
  const services = p.services.slice(0, 4).map(splitService);
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        {p.headshotUrl ? <Photo photoUrl={p.headshotUrl} /> : <Photo photoUrl={p.photoUrl} />}
      </div>
      <div style={{ position: "absolute", top: 44, left: 48, right: 48, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Monogram size={52} />
        {p.socialHandle ? (
          <span style={{ backgroundColor: "rgba(26,26,26,0.72)", color: C.cream, fontSize: 20, fontWeight: 600, padding: "10px 20px", borderRadius: 9999 }}>
            {p.socialHandle}
          </span>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(to top, rgba(26,26,26,0.94) 55%, rgba(26,26,26,0))",
          padding: "120px 52px 44px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ fontFamily: FONT_HEADING, fontSize: 58, fontWeight: 600, color: C.cream, lineHeight: 1.02 }}>
          {p.agentName || "Your Name"}
        </div>
        <div style={{ fontSize: 21, letterSpacing: "0.22em", textTransform: "uppercase", color: C.tan, fontWeight: 700 }}>
          {p.agentTitle || "Your Local Realtor"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {services.map((s, i) => (
            <span key={i} style={{ border: `1px solid ${C.tan}`, color: C.cream, fontSize: 20, padding: "8px 18px", borderRadius: 9999 }}>
              {s.label}
            </span>
          ))}
        </div>
        {p.phone ? <div style={{ fontSize: 23, color: "rgba(242,235,216,0.85)" }}>{p.phone}{p.email ? ` · ${p.email}` : ""}</div> : null}
      </div>
    </>
  );
}

/** Monogram badge over cream — understated personal brand. */
export function AgentBadgeTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px 64px", textAlign: "center", gap: 18 }}>
      <Headshot url={p.headshotUrl} name={p.agentName} size={210} ring={C.tan} />
      <div style={{ fontFamily: FONT_HEADING, fontSize: 66, fontWeight: 600, lineHeight: 1.02, color: C.black }}>
        {p.agentName || "Your Name"}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ height: 1, width: 46, backgroundColor: C.tan }} />
        <span style={{ fontSize: 22, letterSpacing: "0.3em", textTransform: "uppercase", color: C.forest }}>{p.agentTitle || "Realtor"}</span>
        <span style={{ height: 1, width: 46, backgroundColor: C.tan }} />
      </div>
      {p.tagline ? <div style={{ fontSize: 25, lineHeight: 1.5, color: "rgba(26,26,26,0.7)", maxWidth: "78%" }}>{p.tagline}</div> : null}
      <StatChips stats={p.services.slice(0, 4).map((s) => splitService(s).label)} color={C.forest} borderColor={C.forest} size={20} />
      <div style={{ fontSize: 21, color: "rgba(26,26,26,0.65)" }}>
        {p.phone}{p.website ? `  ·  ${p.website}` : ""}{p.socialHandle ? `  ·  ${p.socialHandle}` : ""}
      </div>
    </div>
  );
}

/** Forest checklist column + headshot column. */
export function AgentSplitChecklistTemplate(p: TemplateProps) {
  const services = p.services.slice(0, 4).map(splitService);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex" }}>
      <div style={{ flex: 1.1, backgroundColor: C.forest, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, padding: "48px 44px 48px 52px" }}>
        <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "0.26em", color: C.tan, textTransform: "uppercase" }}>How I help</div>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 54, fontWeight: 600, lineHeight: 1.04, color: C.cream }}>
          {p.headline || "Real estate, handled end to end."}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
          {services.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: C.tan, color: C.forest, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, flexShrink: 0 }}>
                ✓
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 23, fontWeight: 700, color: C.cream }}>{s.label}</div>
                {s.desc ? <div style={{ fontSize: 19, color: "rgba(242,235,216,0.66)", lineHeight: 1.3 }}>{s.desc}</div> : null}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, display: "flex" }}>
          <CtaPill cta={p.cta} bg={C.tan} fg={C.forest} size={20} />
        </div>
      </div>
      <div style={{ flex: 0.9, position: "relative" }}>
        {p.headshotUrl ? <Photo photoUrl={p.headshotUrl} /> : <Photo photoUrl={p.photoUrl} />}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "linear-gradient(to top, rgba(26,26,26,0.8), rgba(26,26,26,0))", padding: "70px 30px 26px", textAlign: "center" }}>
          <div style={{ fontSize: 27, fontWeight: 700, color: C.cream }}>{p.agentName}</div>
          <div style={{ fontSize: 19, color: "rgba(242,235,216,0.75)" }}>{p.phone}</div>
        </div>
      </div>
    </div>
  );
}

/** Follow-me poster — social handle front and center. */
export function AgentFollowTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(26,26,26,0.5)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 60px", gap: 20 }}>
        <Headshot url={p.headshotUrl} name={p.agentName} size={165} ring={C.cream} />
        <div style={{ fontFamily: FONT_HEADING, fontSize: 58, fontWeight: 500, lineHeight: 1.1, color: C.cream }}>
          {p.headline || "Follow for real estate tips"}
        </div>
        {p.tagline ? <div style={{ fontSize: 24, lineHeight: 1.45, color: "rgba(242,235,216,0.85)", maxWidth: "82%" }}>{p.tagline}</div> : null}
        <div style={{ backgroundColor: C.cream, color: C.forest, fontSize: 27, fontWeight: 800, padding: "16px 38px", borderRadius: 9999 }}>
          {p.socialHandle || p.website || "@yourhandle"}
        </div>
        <div style={{ fontSize: 20, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(242,235,216,0.8)" }}>
          {p.agentName}{p.agentTitle ? ` · ${p.agentTitle}` : ""}
        </div>
      </div>
    </>
  );
}

/** Market-expert: area chips + headshot on cream. */
export function AgentMarketTemplate(p: TemplateProps) {
  const areas = (p.address || "Cape Coral · Fort Myers · Naples").split("·").map((a) => a.trim()).filter(Boolean);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#ffffff", display: "flex", flexDirection: "column", padding: "48px 54px 40px" }}>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.26em", color: C.tan, textTransform: "uppercase" }}>Your market expert</div>
          <div style={{ fontFamily: FONT_HEADING, fontSize: 64, fontWeight: 600, lineHeight: 1.02, color: C.black, marginTop: 10 }}>
            {p.agentName || "Your Name"}
          </div>
          {p.agentTitle ? <div style={{ fontSize: 23, color: "rgba(26,26,26,0.65)", marginTop: 8 }}>{p.agentTitle}</div> : null}
        </div>
        <Headshot url={p.headshotUrl} name={p.agentName} size={150} ring={C.tan} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
        {areas.map((a, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 8, border: `2px solid ${C.forest}`, color: C.forest, fontSize: 22, fontWeight: 600, padding: "10px 20px", borderRadius: 9999 }}>
            <span style={{ color: C.tan }}>📍</span>{a}
          </span>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, marginTop: 24, position: "relative", borderRadius: 16, overflow: "hidden" }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 22 }}>
        <div style={{ fontSize: 22, color: "rgba(26,26,26,0.7)" }}>
          {p.phone}{p.email ? ` · ${p.email}` : ""}
        </div>
        <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={20} />
      </div>
    </div>
  );
}

/** Tagline as a testimonial-style card floating over a photo. */
export function AgentTestimonialTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Photo photoUrl={p.photoUrl} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(26,26,26,0.55), rgba(26,26,26,0.1))" }} />
      <div
        style={{
          position: "absolute",
          left: 56,
          bottom: 56,
          maxWidth: "64%",
          backgroundColor: "rgba(242,235,216,0.97)",
          borderLeft: `8px solid ${C.tan}`,
          padding: "34px 38px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          boxShadow: "0 24px 60px rgba(26,26,26,0.4)",
        }}
      >
        <div style={{ fontFamily: FONT_HEADING, fontSize: 38, fontStyle: "italic", lineHeight: 1.25, color: C.black }}>
          &ldquo;{p.tagline || "Helping SWFL families find home, one closing at a time."}&rdquo;
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Headshot url={p.headshotUrl} name={p.agentName} size={72} ring={C.tan} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.black }}>{p.agentName || "Your Name"}</div>
            <div style={{ fontSize: 19, color: "rgba(26,26,26,0.62)" }}>
              {p.agentTitle || "Realtor"}{p.phone ? ` · ${p.phone}` : ""}
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 44, right: 48 }}>
        <Monogram size={56} />
      </div>
    </>
  );
}

/** Two-person team intro — agent + partner side by side. */
export function AgentTeamTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column", padding: "46px 52px 40px" }}>
      <div style={{ flexShrink: 0, textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.28em", color: C.tan, textTransform: "uppercase" }}>Meet the team</div>
        <div style={{ fontFamily: FONT_HEADING, fontSize: 58, fontWeight: 600, lineHeight: 1.05, color: C.black, marginTop: 10 }}>
          {p.headline || "Two agents. One goal — your keys."}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", gap: 20, marginTop: 26 }}>
        <div style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 18, padding: "28px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", border: "1px solid rgba(61,74,47,0.14)" }}>
          <Headshot url={p.headshotUrl} name={p.agentName} size={140} ring={C.tan} />
          <div style={{ fontFamily: FONT_HEADING, fontSize: 36, fontWeight: 600, color: C.black, lineHeight: 1.05 }}>{p.agentName || "Agent One"}</div>
          {p.agentTitle ? <div style={{ fontSize: 20, color: "rgba(26,26,26,0.62)" }}>{p.agentTitle}</div> : null}
          {p.phone ? <div style={{ fontSize: 21, fontWeight: 700, color: C.forest }}>{p.phone}</div> : null}
        </div>
        <div style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 18, padding: "28px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", border: "1px solid rgba(61,74,47,0.14)" }}>
          <Headshot url={p.partnerHeadshotUrl} name={p.partnerName || "Partner"} size={140} ring={C.sage} />
          <div style={{ fontFamily: FONT_HEADING, fontSize: 36, fontWeight: 600, color: C.black, lineHeight: 1.05 }}>{p.partnerName || "Agent Two"}</div>
          {p.partnerRole ? <div style={{ fontSize: 20, color: "rgba(26,26,26,0.62)" }}>{p.partnerRole}</div> : null}
          {p.partnerPhone ? <div style={{ fontSize: 21, fontWeight: 700, color: C.forest }}>{p.partnerPhone}</div> : null}
        </div>
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 24 }}>
        <CtaPill cta={p.cta} bg={C.forest} fg={C.cream} size={21} />
        {p.website ? <span style={{ fontSize: 21, color: "rgba(26,26,26,0.65)" }}>{p.website}</span> : null}
      </div>
    </div>
  );
}
