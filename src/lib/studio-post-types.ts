/**
 * Post-type presets for Post Studio.
 * Each preset drives the eyebrow label, whether a price line shows, and a
 * sensible default call-to-action. `sensitive` flags commercial-only showcases
 * (e.g. a funeral home) where residential listing language must never appear.
 * `agent` flags agent-promo posts — the form swaps listing specs for
 * services / social fields and the Agent Promo templates light up.
 */

export type PostTypeKey =
  | "now_leasing"
  | "just_listed"
  | "just_sold"
  | "under_contract"
  | "price_reduction"
  | "just_closed"
  | "back_on_market"
  | "new_construction"
  | "coming_soon"
  | "open_house"
  | "agent_promo"
  | "recently_photographed"
  // Short-term rental (Airbnb host) posts
  | "now_booking"
  | "open_dates"
  | "guest_favorite";

export type PostTypeConfig = {
  readonly name: string;
  readonly eyebrow: string;
  readonly showPrice: boolean;
  readonly defaultCta: string;
  /** Commercial-sensitive showcase (e.g. funeral home) — no listing language. */
  readonly sensitive?: boolean;
  /** Agent self-promo — services/social fields instead of listing specs. */
  readonly agent?: boolean;
  /** Short-term rental post — price reads as a nightly rate. */
  readonly host?: boolean;
};

export const POST_TYPES: Record<PostTypeKey, PostTypeConfig> = {
  now_leasing: {
    name: "Now Leasing",
    eyebrow: "NOW LEASING",
    showPrice: false,
    defaultCta: "DM to schedule a tour",
  },
  just_listed: {
    name: "Just Listed",
    eyebrow: "JUST LISTED",
    showPrice: true,
    defaultCta: "DM for a private showing",
  },
  just_sold: {
    name: "Just Sold",
    eyebrow: "JUST SOLD",
    showPrice: false,
    defaultCta: "Thinking of selling? Let's talk",
  },
  under_contract: {
    name: "Under Contract",
    eyebrow: "UNDER CONTRACT",
    showPrice: false,
    defaultCta: "Want results like this? Let's talk",
  },
  price_reduction: {
    name: "Price Reduction",
    eyebrow: "PRICE REDUCTION",
    showPrice: true,
    defaultCta: "DM before it's gone",
  },
  just_closed: {
    name: "Just Closed",
    eyebrow: "JUST CLOSED",
    showPrice: false,
    defaultCta: "Ready for your closing day? Let's talk",
  },
  back_on_market: {
    name: "Back on Market",
    eyebrow: "BACK ON THE MARKET",
    showPrice: true,
    defaultCta: "DM for a showing before it's gone again",
  },
  new_construction: {
    name: "New Construction",
    eyebrow: "NEW CONSTRUCTION",
    showPrice: false,
    defaultCta: "DM for builder details",
  },
  coming_soon: {
    name: "Coming Soon",
    eyebrow: "COMING SOON",
    showPrice: false,
    defaultCta: "DM to get on the list",
  },
  open_house: {
    name: "Open House",
    eyebrow: "OPEN HOUSE",
    showPrice: true,
    defaultCta: "Details in DM",
  },
  agent_promo: {
    name: "Agent Promo",
    eyebrow: "YOUR LOCAL REALTOR",
    showPrice: false,
    defaultCta: "Let's achieve your real estate goals",
    agent: true,
  },
  recently_photographed: {
    name: "Recently Photographed",
    eyebrow: "RECENTLY PHOTOGRAPHED",
    showPrice: false,
    defaultCta: "Book your shoot",
    sensitive: true,
  },
  now_booking: {
    name: "Now Booking",
    eyebrow: "NOW BOOKING",
    showPrice: true,
    defaultCta: "Book your dates — link in bio",
    host: true,
  },
  open_dates: {
    name: "Open Dates",
    eyebrow: "DATES JUST OPENED",
    showPrice: true,
    defaultCta: "Grab them before they're gone — link in bio",
    host: true,
  },
  guest_favorite: {
    name: "Guest Favorite",
    eyebrow: "GUEST FAVORITE",
    showPrice: false,
    defaultCta: "Book your stay — link in bio",
    host: true,
  },
};

export const POST_TYPE_ORDER: readonly PostTypeKey[] = [
  "now_leasing",
  "just_listed",
  "just_sold",
  "under_contract",
  "price_reduction",
  "just_closed",
  "back_on_market",
  "new_construction",
  "coming_soon",
  "open_house",
  "agent_promo",
  "recently_photographed",
  "now_booking",
  "open_dates",
  "guest_favorite",
];

/** Host accounts see their own post types first, sale types after. */
export const HOST_POST_TYPE_ORDER: readonly PostTypeKey[] = [
  "now_booking",
  "open_dates",
  "guest_favorite",
  "now_leasing",
  "coming_soon",
  "recently_photographed",
];

export type PostFormat = "square" | "story" | "facebook";

export const FORMAT_DIMENSIONS: Record<PostFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  facebook: { width: 1200, height: 630 },
};

export const FORMAT_LABELS: Record<PostFormat, string> = {
  square: "Square 1080×1080",
  story: "Story 1080×1920",
  facebook: "Facebook 1200×630",
};

export const FORMAT_ORDER: readonly PostFormat[] = ["square", "story", "facebook"];
