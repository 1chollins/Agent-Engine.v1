-- Migration: Add "creatomate" to cost_logs.service CHECK constraint
-- Date: 2026-04-13
-- Purpose: Allow logging Creatomate render costs with correct service name
--          instead of using "transloadit" as a placeholder.
-- Apply: Paste into Supabase SQL Editor and run

-- Drop existing CHECK constraint and replace with updated one
ALTER TABLE cost_logs
  DROP CONSTRAINT IF EXISTS cost_logs_service_check;

ALTER TABLE cost_logs
  ADD CONSTRAINT cost_logs_service_check
    CHECK (service IN ('claude', 'runway', 'kling', 'bannerbear', 'transloadit', 'creatomate'));
