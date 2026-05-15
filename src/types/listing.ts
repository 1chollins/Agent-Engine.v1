export type PropertyType =
  | "single_family"
  | "condo"
  | "townhome"
  | "villa"
  | "multi_family"
  | "vacant_land";

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "single_family", label: "Single Family Home" },
  { value: "condo", label: "Condo" },
  { value: "townhome", label: "Townhome" },
  { value: "villa", label: "Villa" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "vacant_land", label: "Vacant Land" },
];

export type ListingStatus =
  | "draft"
  | "pending_payment"
  | "processing"
  | "complete"
  | "partial_failure"
  | "failed";

export type Listing = {
  id: string;
  user_id: string;
  brand_profile_id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number;
  lot_size: string | null;
  price: number;
  year_built: number | null;
  features: string;
  neighborhood: string | null;
  hoa_info: string | null;
  additional_notes: string | null;
  status: ListingStatus;
  vertical_hero_photo_id: string | null;
  created_at: string;
  updated_at: string;
};

export const CONTENT_TAGS = [
  "kitchen",
  "bathroom",
  "bedroom",
  "living_room",
  "dining_room",
  "exterior_front",
  "exterior_back",
  "exterior_aerial",
  "pool",
  "garage",
  "office",
  "closet",
  "hallway",
  "detail_shot",
  "view",
  "other",
] as const;

export type ContentTag = (typeof CONTENT_TAGS)[number];

export type ListingPhoto = {
  id: string;
  listing_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  sort_order: number;
  is_hero: boolean;
  orientation: "horizontal" | "vertical" | "square" | null;
  content_tag: ContentTag | null;
  uploaded_at: string;
  previewUrl?: string;
};

export type ListingFormState = {
  error: string | null;
  success: string | null;
  listingId?: string;
};

export const MIN_PHOTOS = 20;
export const MAX_PHOTOS = 40;
export const MIN_VERTICAL_PHOTOS = 5;
export const MAX_VERTICAL_PHOTOS = 40;
export const MAX_PHOTO_SIZE = 25 * 1024 * 1024; // 25MB
