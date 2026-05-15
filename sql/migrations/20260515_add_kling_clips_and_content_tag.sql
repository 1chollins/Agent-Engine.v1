-- Migration: add kling_clips table and content_tag column for AI motion pipeline
-- Date: 2026-05-15
-- Run against: production Supabase + any new local databases

-- Table to track Kling AI video clip renders with caching
CREATE TABLE kling_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES listing_photos(id) ON DELETE CASCADE,
  prompt_hash TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
  fal_request_id TEXT,
  video_url TEXT,
  error_message TEXT,
  cost_usd NUMERIC(10,4),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(photo_id, prompt_hash)
);

CREATE INDEX idx_kling_clips_listing ON kling_clips(listing_id);
CREATE INDEX idx_kling_clips_status ON kling_clips(status);
CREATE INDEX idx_kling_clips_cache_lookup ON kling_clips(photo_id, prompt_hash, status);

-- Add content_tag column to listing_photos for AI motion prompt generation
ALTER TABLE listing_photos
ADD COLUMN content_tag TEXT
  CHECK (content_tag IN (
    'kitchen', 'bathroom', 'bedroom', 'living_room', 'dining_room',
    'exterior_front', 'exterior_back', 'exterior_aerial',
    'pool', 'garage', 'office', 'closet', 'hallway',
    'detail_shot', 'view', 'other'
  ));

CREATE INDEX idx_listing_photos_content_tag ON listing_photos(content_tag);
