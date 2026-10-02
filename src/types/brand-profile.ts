/**
 * Who a profile markets for. "agent" = realtor campaigns (Just listed, price,
 * showings). "host" = Airbnb / short-term rental campaigns (Now booking,
 * nightly rate, book your stay).
 */
export type ProfileType = "agent" | "host";

export const PROFILE_TYPES: { value: ProfileType; label: string; hint: string }[] = [
  { value: "agent", label: "Realtor", hint: "Listings for sale: price, showings, open houses" },
  { value: "host", label: "Airbnb host", hint: "Short-term rentals: nightly rate, amenities, book your stay" },
];

export type BrandProfile = {
  id: string;
  user_id: string;
  profile_type: ProfileType;
  /** Name, email and phone are the only required fields. */
  agent_name: string;
  agent_title: string | null;
  /** Brokerage for realtors; business / property name for hosts. */
  brokerage_name: string | null;
  phone: string;
  email: string;
  /** Hosts: Airbnb / VRBO / direct booking link. */
  booking_url: string | null;
  website: string | null;
  instagram_handle: string | null;
  facebook_url: string | null;
  headshot_path: string | null;
  logo_path: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string | null;
  tone: BrandTone;
  is_complete: boolean;
  /** The account's own profile. Client agents are extra rows with false. */
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

/** A profile the listing form can pick: the account's own, or a client agent. */
export type AgentOption = {
  id: string;
  agent_name: string;
  brokerage_name: string | null;
  profile_type: ProfileType;
  is_primary: boolean;
};

export type BrandTone = "professional" | "friendly" | "luxury" | "casual";

export const BRAND_TONES: { value: BrandTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "luxury", label: "Luxury" },
  { value: "casual", label: "Casual" },
];

export type BrandProfileFormState = {
  error: string | null;
  success: string | null;
  missingFields?: string[];
};
