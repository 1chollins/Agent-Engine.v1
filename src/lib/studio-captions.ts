/**
 * Template-based caption + hashtag generator for Post Studio.
 * No AI — deterministic fills drawn from the brand voice in the PLAYBOOK, so
 * the studio hands you a ready-to-paste caption alongside the graphic.
 * FramePostReady remains the AI copy engine; this is the quick complement.
 */

import { POST_TYPES, type PostTypeKey } from "@/lib/studio-post-types";

export type CaptionInput = {
  postType: PostTypeKey;
  headline: string;
  area: string;
  stats: readonly string[];
  features: readonly string[];
  price: string;
  showPrice: boolean;
  cta: string;
};

const BASE_TAGS = [
  "#swflrealestate",
  "#realestatephotography",
  "#frameandformstudio",
];

const AREA_TAGS: Record<string, string[]> = {
  "cape coral": ["#capecoral", "#capecoralrealestate", "#capecoralfl"],
  "fort myers": ["#fortmyers", "#fortmyersrealestate", "#swfl"],
  naples: ["#naples", "#naplesrealestate", "#naplesflorida"],
};

const TYPE_TAGS: Record<PostTypeKey, string[]> = {
  now_leasing: ["#nowleasing", "#forrent", "#rentalhome"],
  just_listed: ["#justlisted", "#newlisting", "#homeforsale"],
  just_sold: ["#justsold", "#sold", "#realtorlife"],
  under_contract: ["#undercontract", "#pending", "#realtorlife"],
  price_reduction: ["#pricereduced", "#newprice", "#homeforsale"],
  just_closed: ["#justclosed", "#closingday", "#keysinhand"],
  back_on_market: ["#backonmarket", "#secondchance", "#homeforsale"],
  new_construction: ["#newconstruction", "#newbuild", "#swflnewhomes"],
  coming_soon: ["#comingsoon", "#newlisting", "#staytuned"],
  open_house: ["#openhouse", "#homeforsale", "#realestate"],
  agent_promo: ["#realtor", "#realestateagent", "#swflrealtor"],
  recently_photographed: ["#commercialphotography", "#realestatemedia", "#swflbusiness"],
};

/** First sentence of the caption, per post type. Keeps the brand voice. */
function leadLine(input: CaptionInput): string {
  const where = input.area.trim();
  const inArea = where ? ` in ${where}` : "";
  switch (input.postType) {
    case "now_leasing":
      return `Now leasing${inArea}. ✨`;
    case "just_listed":
      return `Just listed${inArea}. 🔑`;
    case "just_sold":
      return `Just sold${inArea}! Another happy close. 🥂`;
    case "coming_soon":
      return `Coming soon${inArea}. 👀`;
    case "open_house":
      return `Open house${inArea} this weekend. 🏡`;
    case "under_contract":
      return `Under contract${inArea}! 🤝`;
    case "price_reduction":
      return `Price improvement${inArea} — don't sleep on this one. 📉`;
    case "just_closed":
      return `Just closed${inArea}! Keys are in hand. 🔑🥂`;
    case "back_on_market":
      return `Back on the market${inArea} — second chances don't knock twice. ⏰`;
    case "new_construction":
      return `Brand-new construction${inArea}. 🏗️`;
    case "agent_promo":
      return `Your local realtor${inArea ? inArea.replace(" in ", " for ") : ""} — let's talk real estate. 🏡`;
    case "recently_photographed":
      return `Recently photographed${inArea}. 📸`;
  }
}

export function buildCaption(input: CaptionInput): { caption: string; hashtags: string } {
  const config = POST_TYPES[input.postType];
  const lines: string[] = [];

  lines.push(leadLine(input));

  if (input.headline.trim()) {
    lines.push(input.headline.trim());
  }

  // Specs — skipped for sensitive (commercial-only) showcases.
  if (!config.sensitive && input.stats.length > 0) {
    lines.push(input.stats.join("  •  "));
  }

  const features = input.features.filter((f) => f.trim());
  if (features.length > 0) {
    lines.push(features.map((f) => `• ${f}`).join("\n"));
  }

  if (input.showPrice && input.price.trim()) {
    lines.push(`Offered at ${input.price.trim()}.`);
  }

  if (input.cta.trim()) {
    lines.push(`👉 ${input.cta.trim()}`);
  }

  // Hashtags
  const areaKey = input.area.trim().toLowerCase();
  const areaTags = Object.keys(AREA_TAGS).find((k) => areaKey.includes(k));
  const tags = [
    ...BASE_TAGS,
    ...(areaTags ? AREA_TAGS[areaTags] : []),
    ...TYPE_TAGS[input.postType],
  ];
  const hashtags = Array.from(new Set(tags)).join(" ");

  return { caption: lines.join("\n\n"), hashtags };
}
