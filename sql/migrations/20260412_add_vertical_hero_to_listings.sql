-- Migration: Add vertical_hero_photo_id to listings
-- Date: 2026-04-12
-- Spec: docs/v1.1-hybrid-photos-spec.md — Phase 1 Step 6
-- Apply: Paste into Supabase SQL Editor and run

ALTER TABLE listings
  ADD COLUMN vertical_hero_photo_id uuid NULL
    REFERENCES listing_photos(id) ON DELETE SET NULL;
