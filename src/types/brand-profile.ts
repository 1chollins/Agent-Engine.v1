export type BrandProfile = {
  id: string;
  user_id: string;
  agent_name: string;
  agent_title: string;
  brokerage_name: string;
  phone: string;
  email: string;
  website: string | null;
  instagram_handle: string | null;
  facebook_url: string | null;
  headshot_path: string;
  logo_path: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string | null;
  tone: BrandTone;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
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
