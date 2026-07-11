import {
  C,
  FONT_HEADING,
  Monogram,
  Photo,
  priceLine,
  StatRow,
  type TemplateProps,
} from "./shared";

/* ---------------------------------------------------------------- helpers */

function LogoOrMono({ logoUrl, size = 46 }: { logoUrl: string | null; size?: number }) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt="" style={{ height: size, maxWidth: size * 3.4, objectFit: "contain", display: "block" }} />;
  }
  return <Monogram size={size} bg={C.tan} fg={C.forest} />;
}

function Headshot({ url, size = 120, ring = C.tan }: { url: string | null; size?: number; ring?: string }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: `3px solid ${ring}`, flexShrink: 0, backgroundColor: C.sage }}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : null}
    </div>
  );
}

function Cell({ url }: { url: string | null }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%" }}>
      <Photo photoUrl={url} />
    </div>
  );
}

function ContactBar({
  phone,
  website,
  address,
  logoUrl,
  bg = C.forest,
  fg = C.cream,
}: {
  phone: string;
  website: string;
  address: string;
  logoUrl: string | null;
  bg?: string;
  fg?: string;
}) {
  const items = [phone, website, address].filter((x) => x && x.trim());
  if (items.length === 0 && !logoUrl) return null;
  return (
    <div style={{ flexShrink: 0, backgroundColor: bg, padding: "20px 44px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, color: fg, fontSize: 21 }}>
        {items.map((t, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {i > 0 ? <span style={{ color: C.tan, fontWeight: 700 }}>·</span> : null}
            {t}
          </span>
        ))}
      </div>
      <LogoOrMono logoUrl={logoUrl} />
    </div>
  );
}

/* -------------------------------------------------------------- templates */

/** Hero photo + 3-photo strip + info + contact bar. (Grey Collage / Perfect Home) */
export function CollageHeroTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative" }}>
        <Cell url={p.photos[0] ?? null} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", gap: 6, height: 150 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <Cell url={p.photos[i] ?? null} />
          </div>
        ))}
      </div>
      <div style={{ flexShrink: 0, padding: "26px 44px 22px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ color: C.tan, fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>{p.eyebrow}</span>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 46, fontWeight: 600, lineHeight: 1.0, color: C.forest }}>{p.headline}</div>
          ) : null}
          <StatRow stats={p.stats} color="rgba(26,26,26,0.7)" dotColor={C.tan} size={24} />
        </div>
        <span style={{ color: C.tan, fontSize: 36, fontWeight: 700, whiteSpace: "nowrap" }}>{priceLine(p.showPrice, p.price)}</span>
      </div>
      <ContactBar phone={p.phone} website={p.website} address={p.address} logoUrl={p.logoUrl} />
    </div>
  );
}

/** 2×2 photo grid + headshot + agent + big status. (Just Sold) */
export function QuadGridTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.cream, padding: 36, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <span style={{ fontFamily: FONT_HEADING, fontSize: 54, fontWeight: 700, lineHeight: 0.95, color: C.forest, textTransform: "uppercase" }}>{p.eyebrow}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {p.headshotUrl ? <Headshot url={p.headshotUrl} size={96} /> : null}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {p.agentName ? <span style={{ color: C.forest, fontSize: 26, fontWeight: 700 }}>{p.agentName}</span> : null}
            {p.phone ? <span style={{ color: "rgba(26,26,26,0.6)", fontSize: 20 }}>{p.phone}</span> : null}
          </div>
        </div>
      </div>
      <div style={{ flex: "1 1 auto", minHeight: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <Cell key={i} url={p.photos[i] ?? null} />
        ))}
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <LogoOrMono logoUrl={p.logoUrl} size={40} />
        {p.website ? <span style={{ color: "rgba(26,26,26,0.7)", fontSize: 22, letterSpacing: "0.04em" }}>{p.website}</span> : null}
      </div>
    </div>
  );
}

/** Headshot hero + big serif + name/title + contact. (Meet Your Agent) */
export function MeetAgentTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.forest, display: "flex", flexDirection: "row" }}>
      <div style={{ flex: "1 1 46%", position: "relative" }}>
        <Cell url={p.headshotUrl ?? p.photos[0] ?? null} />
      </div>
      <div style={{ width: "54%", padding: "60px 48px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        <span style={{ color: C.tan, fontSize: 22, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase" }}>{p.eyebrow}</span>
        {p.headline ? (
          <div style={{ fontFamily: FONT_HEADING, fontSize: 72, fontWeight: 500, lineHeight: 0.98, color: C.cream }}>{p.headline}</div>
        ) : null}
        {p.features.length > 0 ? (
          <div style={{ fontSize: 24, lineHeight: 1.4, color: "rgba(242,235,216,0.7)" }}>{p.features.join(" · ")}</div>
        ) : null}
        <div style={{ width: 56, height: 2, backgroundColor: C.tan, marginTop: 4 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontFamily: FONT_HEADING, fontSize: 40, fontWeight: 600, color: C.cream }}>{p.agentName || "Frame & Form Studio"}</span>
          <span style={{ color: C.tan, fontSize: 20, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {p.agentTitle || "SWFL Real Estate Media"}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6, color: "rgba(242,235,216,0.85)", fontSize: 21 }}>
          {p.phone ? <span>{p.phone}</span> : null}
          {p.website ? <span>{p.website}</span> : null}
        </div>
      </div>
    </div>
  );
}

/** Hero photo + labeled side thumbnails + price + contact. (Blue Modern) */
export function LabeledThumbsTemplate(p: TemplateProps) {
  const labels = p.features.length > 0 ? p.features : ["Interior", "Kitchen", "Exterior"];
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.forest, display: "flex", flexDirection: "row" }}>
      <div style={{ width: "34%", padding: "32px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ color: C.tan, fontSize: 18, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              {labels[i - 1] ?? ""}
            </span>
            <div style={{ height: 130, borderRadius: 10, overflow: "hidden", position: "relative" }}>
              <Cell url={p.photos[i] ?? null} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: "1 1 auto", position: "relative" }}>
        <Cell url={p.photos[0] ?? null} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(61,74,47,0.92) 0%, rgba(61,74,47,0) 45%)" }} />
        <div style={{ position: "absolute", top: 32, right: 32 }}>
          <LogoOrMono logoUrl={p.logoUrl} size={46} />
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 36, display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ color: C.tan, fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>{p.eyebrow}</span>
          {p.headline ? (
            <div style={{ fontFamily: FONT_HEADING, fontSize: 58, fontWeight: 500, lineHeight: 1.0, color: C.cream }}>{p.headline}</div>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <span style={{ color: C.tan, fontSize: 38, fontWeight: 700 }}>{priceLine(p.showPrice, p.price)}</span>
            {p.phone ? <span style={{ color: "rgba(242,235,216,0.9)", fontSize: 22 }}>{p.phone}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Single hero + thin inset frame, address top, big SOLD center, agent bottom. (White Grey Sold) */
export function FramedSoldTemplate(p: TemplateProps) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0 }}>
        <Cell url={p.photos[0] ?? null} />
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(26,26,26,0.32)" }} />
      <div style={{ position: "absolute", inset: 46, border: `1px solid ${C.cream}` }} />
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ color: C.cream, fontSize: 22, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase" }}>
          {p.address || p.headline}
        </span>
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: FONT_HEADING, fontSize: 130, fontWeight: 600, letterSpacing: "0.06em", color: C.cream, textTransform: "uppercase" }}>
          {p.eyebrow}
        </span>
      </div>
      <div style={{ position: "absolute", bottom: 66, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <StatRow stats={p.stats} color={C.cream} dotColor={C.tan} size={24} />
        {p.agentName ? (
          <span style={{ color: C.tan, fontSize: 22, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>{p.agentName}</span>
        ) : null}
      </div>
    </>
  );
}

/** Hero + 2 stacked thumbnails + price + stats + contact. (New Listing / Dark Blue) */
export function ListingContactTemplate(p: TemplateProps) {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: C.forest, display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 40px 16px" }}>
        <span style={{ fontFamily: FONT_HEADING, fontSize: 44, fontWeight: 600, color: C.cream }}>{p.eyebrow}</span>
        <LogoOrMono logoUrl={p.logoUrl} size={46} />
      </div>
      <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", gap: 8, padding: "0 40px" }}>
        <div style={{ flex: "1 1 62%", position: "relative", overflow: "hidden", borderRadius: 12 }}>
          <Cell url={p.photos[0] ?? null} />
        </div>
        <div style={{ width: "36%", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ flex: 1, position: "relative", overflow: "hidden", borderRadius: 12 }}>
            <Cell url={p.photos[1] ?? null} />
          </div>
          <div style={{ flex: 1, position: "relative", overflow: "hidden", borderRadius: 12 }}>
            <Cell url={p.photos[2] ?? null} />
          </div>
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <span style={{ color: C.tan, fontSize: 46, fontWeight: 800 }}>{priceLine(p.showPrice, p.price)}</span>
        <StatRow stats={p.stats} color="rgba(242,235,216,0.9)" dotColor={C.tan} size={24} />
      </div>
      <ContactBar phone={p.phone} website={p.website} address="" logoUrl={null} bg="rgba(26,26,26,0.35)" />
    </div>
  );
}
