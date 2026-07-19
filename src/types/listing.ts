export type PropertyType =
  | "single_family"
  | "condo"
  | "townhome"
  | "villa"
  | "multi_family"
  | "vacant_land"
  | "office"
  | "retail"
  | "mixed_use";

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "single_family", label: "Single Family Home" },
  { value: "condo", label: "Condo" },
  { value: "townhome", label: "Townhome" },
  { value: "villa", label: "Villa" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "vacant_land", label: "Vacant Land" },
  { value: "office", label: "Office" },
  { value: "retail", label: "Retail" },
  { value: "mixed_use", label: "Mixed Use" },
];

/**
 * The content pipeline branches on property class, not on individual property
 * type. A warehouse and an office share a vocabulary; a duplex sold as an
 * investment needs different language from the same duplex sold as a home.
 *
 * Everything downstream — which photo tags are valid, which camera moves are
 * offered, and whether captions talk about lifestyle or about yield — keys off
 * this rather than off `property_type` directly.
 */
export type PropertyClass =
  | "residential"
  | "multifamily"
  | "commercial"
  | "land";

export function getPropertyClass(type: PropertyType): PropertyClass {
  switch (type) {
    case "multi_family":
      return "multifamily";
    case "vacant_land":
      return "land";
    case "office":
    case "retail":
    case "mixed_use":
      return "commercial";
    default:
      return "residential";
  }
}

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
  // --- commercial ---
  "lobby",
  "reception",
  "office_suite",
  "conference_room",
  "break_room",
  "retail_floor",
  "storefront",
  "restroom",
  "parking",
  "building_exterior",
  "signage",
  "common_area",
  // --- multifamily ---
  "unit_interior",
  "fitness_center",
  "clubhouse",
  "laundry",
  "courtyard",
  // --- land ---
  "parcel",
  "frontage",
  "road_access",
  "water_frontage",
] as const;

export type ContentTag = (typeof CONTENT_TAGS)[number];

/**
 * Which tags are offered for a given property class.
 *
 * The photo classifier is given only the relevant list. Handed the full set it
 * will cheerfully label a warehouse mezzanine a "bedroom", and the motion
 * prompt then pushes in toward "the bed and headboard" — the failure this
 * split exists to prevent.
 *
 * Multifamily deliberately reuses the residential interior tags: a unit's
 * kitchen is still a kitchen, and it should inherit the same camera moves.
 */
const SHARED_TAGS = [
  "exterior_aerial",
  "detail_shot",
  "view",
  "other",
] as const satisfies readonly ContentTag[];

export const TAGS_BY_PROPERTY_CLASS: Record<PropertyClass, ContentTag[]> = {
  residential: [
    "kitchen", "bathroom", "bedroom", "living_room", "dining_room",
    "exterior_front", "exterior_back", "pool", "garage", "office",
    "closet", "hallway", ...SHARED_TAGS,
  ],
  multifamily: [
    "unit_interior", "kitchen", "bathroom", "bedroom", "living_room",
    "building_exterior", "common_area", "lobby", "pool", "fitness_center",
    "clubhouse", "laundry", "courtyard", "parking", "hallway", ...SHARED_TAGS,
  ],
  commercial: [
    "lobby", "reception", "office_suite", "conference_room", "break_room",
    "retail_floor", "storefront", "restroom", "parking", "building_exterior",
    "signage", "common_area", "hallway", ...SHARED_TAGS,
  ],
  land: [
    "parcel", "frontage", "road_access", "water_frontage",
    "building_exterior", ...SHARED_TAGS,
  ],
};

export function getTagsForPropertyClass(cls: PropertyClass): ContentTag[] {
  return TAGS_BY_PROPERTY_CLASS[cls] ?? TAGS_BY_PROPERTY_CLASS.residential;
}

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
