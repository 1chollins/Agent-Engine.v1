-- Migration: Add orientation column to listing_photos
-- Date: 2026-04-11
-- Spec: docs/v1.1-hybrid-photos-spec.md — Phase 1 Step 1
-- Apply: Paste into Supabase SQL Editor and run

-- 1. Add column with CHECK constraint and default
ALTER TABLE listing_photos
  ADD COLUMN orientation text NOT NULL DEFAULT 'horizontal'
    CHECK (orientation IN ('horizontal', 'vertical', 'square'));

-- 2. Explicit backfill using width/height ratio.
--    >1.1 = horizontal, <0.9 = vertical, else square.
--    Rows without dimensions keep 'horizontal' default.
UPDATE listing_photos
SET orientation = CASE
  WHEN width IS NOT NULL AND height IS NOT NULL AND height > 0 THEN
    CASE
      WHEN (width::numeric / height::numeric) > 1.1 THEN 'horizontal'
      WHEN (width::numeric / height::numeric) < 0.9 THEN 'vertical'
      ELSE 'square'
    END
  ELSE 'horizontal'
END;

-- 3. Index for photo selection queries that filter by listing + orientation
CREATE INDEX idx_listing_photos_orientation ON listing_photos(listing_id, orientation);

-- 4. Column comment
COMMENT ON COLUMN listing_photos.orientation IS
  'horizontal, vertical, or square. '
  'Auto-detected on upload via sharp. '
  'Used by pipeline photo picker.';
