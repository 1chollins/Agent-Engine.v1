/**
 * Realtor vs Airbnb host — everything that changes with who a campaign is for.
 *
 * A brand profile (the account's own, or a client profile on the Clients page)
 * is either an "agent" (listings for sale) or a "host" (short-term rentals).
 * Every campaign takes its audience from the profile it's made for, so one
 * login can serve both kinds of client.
 *
 * Kept free of server-only imports so pages, prompts and render props can all
 * share one source of wording.
 */
import type { ProfileType } from "@/types/brand-profile";

type ListingLike = {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  property_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  lot_size?: string | null;
  price?: number | null;
  year_built?: number | null;
  features?: string | null;
  neighborhood?: string | null;
  hoa_info?: string | null;
  additional_notes?: string | null;
  max_guests?: number | null;
};

type BrandLike = {
  profile_type?: string | null;
  agent_name?: string | null;
  agent_title?: string | null;
  brokerage_name?: string | null;
  phone?: string | null;
  email?: string | null;
  instagram_handle?: string | null;
  website?: string | null;
  booking_url?: string | null;
};

export function audienceOf(brand: BrandLike | null | undefined): ProfileType {
  return brand?.profile_type === "host" ? "host" : "agent";
}

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

/** "$785,000" for a sale, "$189/night" for a rental; null when no price was given. */
export function priceLabel(price: number | null | undefined, audience: ProfileType): string | null {
  if (!price || price <= 0) return null;
  return audience === "host" ? `${usd(price)}/night` : usd(price);
}

/** "4 Beds", "3 Baths", "2,800 Sq Ft" / "Sleeps 8" — only the facts that were given. */
export function statLines(listing: ListingLike, audience: ProfileType): string[] {
  const out: string[] = [];
  if (audience === "host" && listing.max_guests) out.push(`Sleeps ${listing.max_guests}`);
  if (listing.bedrooms != null && listing.bedrooms > 0)
    out.push(`${listing.bedrooms} ${listing.bedrooms === 1 ? "Bed" : "Beds"}`);
  if (listing.bathrooms != null && listing.bathrooms > 0)
    out.push(`${listing.bathrooms} ${listing.bathrooms === 1 ? "Bath" : "Baths"}`);
  if (audience === "agent" && listing.sqft) out.push(`${listing.sqft.toLocaleString("en-US")} Sq Ft`);
  return out;
}

export function propertyTypeLabel(type: string | null | undefined): string | null {
  return type ? type.replace(/_/g, " ") : null;
}

/** Labels and wording that differ between the two audiences. */
export const AUDIENCE_COPY = {
  agent: {
    noun: "agent",
    writer: "real estate social media copywriter",
    videoWriter: "real estate video content creator",
    heroLabel: "Just Listed",
    newLabel: "New Listing",
    priceKicker: "Offered at",
    ctaLine: "Schedule a private showing",
    ctaShort: "Book a showing",
    priceField: "Price",
    profilesTitle: "Agent",
  },
  host: {
    noun: "host",
    writer: "vacation rental (Airbnb / VRBO) social media copywriter",
    videoWriter: "vacation rental video content creator",
    heroLabel: "Now Booking",
    newLabel: "Now Booking",
    priceKicker: "Stays from",
    ctaLine: "Book your stay",
    ctaShort: "Book your stay",
    priceField: "Nightly rate",
    profilesTitle: "Host",
  },
} as const;

export const THEMES = {
  agent: {
    posts: [
      "Just Listed — grand reveal with key highlights",
      "Lifestyle — paint a picture of daily life in this home",
      "Feature Spotlight — deep dive into standout features",
      "Neighborhood & Location — community, schools, dining, commute",
      "Open House / Call to Action — urgency and next steps",
    ],
    reels: [
      "Virtual Tour — walk-through energy, room-by-room highlights",
      "Top 5 Features — countdown of best selling points",
      "Day in the Life — morning-to-evening lifestyle at this property",
      "Before You Miss It — urgency, scarcity, market context",
      "Your Dream Home — emotional appeal, future-casting",
    ],
    stories: [
      "Sneak Peek — tease a standout feature to spark curiosity",
      "Price Drop / Value Play — highlight the price and what you get",
      "Neighborhood Spotlight — local dining, parks, schools, commute",
      "Last Chance / Urgency — create FOMO, push to action",
    ],
    overlays: [
      "Room-by-room highlights — kitchen, living, master, outdoor",
      "Lifestyle selling points — morning coffee spot, entertaining space, quiet retreat",
      "Numbers that sell — price, sqft, beds/baths, lot size (only the ones given)",
      "Location perks — nearby amenities, commute times, school district",
      "Emotional hooks — dream home language, future-casting, aspirational",
    ],
  },
  host: {
    posts: [
      "Now Booking — reveal the stay with its best highlights",
      "The Guest Experience — paint a picture of a perfect day here",
      "Amenity Spotlight — the pool, view, hot tub or standout comfort",
      "Local Guide — beaches, dining and things to do nearby",
      "Book Your Dates — open dates, the season, a clear call to book",
    ],
    reels: [
      "Walk-Through — arrive and tour the stay room by room",
      "Top 5 Reasons to Book — countdown of the best amenities",
      "A Day Here — morning coffee to sunset, the guest's perfect day",
      "Dates Are Filling — peak season, limited dates, book now",
      "Your Getaway — escape, relaxation, the trip they've been dreaming of",
    ],
    stories: [
      "Sneak Peek — tease a standout amenity to spark curiosity",
      "What's Included — sleeps, beds, baths and the perks guests get",
      "Local Spotlight — beaches, restaurants and attractions nearby",
      "Open Dates — urgency to lock in the next stay",
    ],
    overlays: [
      "Room-by-room highlights — where guests sleep, cook, relax and unwind",
      "Amenities guests love — pool, hot tub, views, workspace, games",
      "Quick facts — sleeps, beds/baths, nightly rate (only the ones given)",
      "Location perks — minutes to the beach, dining, attractions",
      "Getaway hooks — escape, vacation, book your dates",
    ],
  },
} as const;

/** The PROPERTY DETAILS block shared by every caption / overlay prompt. */
export function listingPromptDetails(listing: ListingLike, audience: ProfileType): string {
  const price = priceLabel(listing.price, audience);
  const lines = [
    `Address: ${[listing.address, listing.city, [listing.state, listing.zip_code].filter(Boolean).join(" ")].filter(Boolean).join(", ")}`,
    price ? `${AUDIENCE_COPY[audience].priceField}: ${price}` : null,
    propertyTypeLabel(listing.property_type) ? `Property Type: ${propertyTypeLabel(listing.property_type)}` : null,
    audience === "host" && listing.max_guests ? `Sleeps: ${listing.max_guests} guests` : null,
    listing.bedrooms ? `Bedrooms: ${listing.bedrooms}` : null,
    listing.bathrooms ? `Bathrooms: ${listing.bathrooms}` : null,
    listing.sqft ? `Square Feet: ${listing.sqft.toLocaleString("en-US")}` : null,
    listing.lot_size ? `Lot Size: ${listing.lot_size}` : null,
    audience === "agent" && listing.year_built ? `Year Built: ${listing.year_built}` : null,
    listing.features ? `Key Features: ${listing.features}` : null,
    listing.neighborhood ? `Neighborhood: ${listing.neighborhood}` : null,
    audience === "agent" && listing.hoa_info ? `HOA: ${listing.hoa_info}` : null,
    listing.additional_notes ? `Notes: ${listing.additional_notes}` : null,
  ];
  return lines.filter(Boolean).join("\n");
}

/** Who to contact — only the fields the profile actually has. */
export function brandPromptDetails(brand: BrandLike, audience: ProfileType): string {
  const lines = [
    `Name: ${brand.agent_name ?? ""}`,
    brand.agent_title ? `Title: ${brand.agent_title}` : null,
    brand.brokerage_name ? `${audience === "host" ? "Business" : "Brokerage"}: ${brand.brokerage_name}` : null,
    brand.phone ? `Phone: ${brand.phone}` : null,
    brand.email ? `Email: ${brand.email}` : null,
    brand.instagram_handle ? `Instagram: ${brand.instagram_handle}` : null,
    audience === "host" && brand.booking_url ? `Booking link: ${brand.booking_url}` : null,
  ];
  return `${audience === "host" ? "HOST" : "AGENT"} INFO:\n${lines.filter(Boolean).join("\n")}`;
}

/**
 * Rules every prompt gets, so captions never invent what was left blank and
 * host campaigns never read like a sale.
 */
export function audienceRules(listing: ListingLike, audience: ProfileType): string {
  const rules: string[] = [];
  if (!listing.price) {
    rules.push(
      audience === "host"
        ? "- No nightly rate was given. Do not mention or invent a price."
        : "- No price was given. Do not mention or invent a price.",
    );
  }
  rules.push("- Only use details listed above. Never invent bedrooms, square footage, amenities or prices.");
  if (audience === "host") {
    rules.push(
      "- This is a short-term rental (Airbnb / VRBO), NOT a home for sale. Write for travelers and guests.",
      "- Never say: for sale, just listed, buyers, open house, showing, mortgage, offer, closing, investment.",
      "- Calls to action are about booking a stay (e.g. \"Book your dates\", \"Link in bio to book\", \"DM to check availability\").",
      "- Hashtags: destination, travel, vacation rental and Airbnb tags for the city — not real estate tags.",
    );
  }
  return rules.join("\n");
}

/** City as a hashtag-safe word: "Fort Myers" → "FortMyers". */
export function cityTag(city: string | null | undefined): string {
  return (city ?? "").replace(/[^A-Za-z0-9]/g, "");
}
