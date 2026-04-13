-- Migration: Add template_key column to content_pieces
-- Date: 2026-04-13
-- Purpose: Store which Creatomate template was selected for each reel/story piece.
-- Null for posts (no Creatomate template). Populated at package creation time.
-- Apply: Paste into Supabase SQL Editor and run

ALTER TABLE content_pieces
  ADD COLUMN template_key text;

COMMENT ON COLUMN content_pieces.template_key IS
  'Creatomate template key selected for this piece (e.g. day1_just_listed, story_triple_slide). '
  'Null for posts. Set during package creation by template selector.';
