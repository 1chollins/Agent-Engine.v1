export type ContentPackageStatus =
  | "pending"
  | "processing"
  | "complete"
  | "partial_failure"
  | "failed";

export type ContentPieceStatus = "pending" | "processing" | "complete" | "failed";

export type ContentType = "post" | "reel" | "story";

export type Platform = "instagram" | "facebook" | "both";

export type ContentPackage = {
  id: string;
  listing_id: string;
  status: ContentPackageStatus;
  total_pieces: number;
  completed_pieces: number;
  failed_pieces: number;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  total_cost_usd: number | null;
  created_at: string;
};

export type ContentPiece = {
  id: string;
  package_id: string;
  day_number: number;
  content_type: ContentType;
  platform: Platform;
  status: ContentPieceStatus;
  retry_count: number;
  asset_path: string | null;
  asset_path_alt: string | null;
  asset_type: string | null;
  caption_instagram: string | null;
  caption_facebook: string | null;
  hashtags: string | null;
  text_overlay: string | null;
  story_teaser: string | null;
  story_cta: string | null;
  recommended_time: string;
  source_photo_ids: string[] | null;
  error_message: string | null;
  generated_at: string | null;
  created_at: string;
};

// Fixed 14-day content calendar from PRD
export const CONTENT_CALENDAR: {
  day: number;
  type: ContentType;
  platform: Platform;
  time: string;
}[] = [
  { day: 1, type: "post", platform: "both", time: "9:00 AM" },
  { day: 2, type: "reel", platform: "both", time: "12:00 PM" },
  { day: 3, type: "story", platform: "both", time: "6:00 PM" },
  { day: 4, type: "post", platform: "both", time: "9:00 AM" },
  { day: 5, type: "reel", platform: "both", time: "12:00 PM" },
  { day: 6, type: "story", platform: "both", time: "6:00 PM" },
  { day: 7, type: "post", platform: "both", time: "9:00 AM" },
  { day: 8, type: "reel", platform: "both", time: "12:00 PM" },
  { day: 9, type: "story", platform: "both", time: "6:00 PM" },
  { day: 10, type: "post", platform: "both", time: "9:00 AM" },
  { day: 11, type: "reel", platform: "both", time: "12:00 PM" },
  { day: 12, type: "story", platform: "both", time: "6:00 PM" },
  { day: 13, type: "post", platform: "both", time: "9:00 AM" },
  { day: 14, type: "reel", platform: "both", time: "12:00 PM" },
];
