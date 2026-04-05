-- ============================================================
-- Agent Engine v1 — Storage Bucket Configuration
-- ============================================================
--
-- IMPORTANT: Buckets must be created MANUALLY in the Supabase Dashboard first.
-- Go to: Storage > New Bucket, and create these three buckets:
--
--   1. brand-assets    (Private, 5MB file size limit)
--   2. listing-photos  (Private, 10MB file size limit)
--   3. generated-content (Private, 100MB file size limit)
--
-- After creating the buckets, run the RLS policies below in the SQL Editor.
-- ============================================================

-- brand-assets: users can manage files in their own {user_id}/ folder
CREATE POLICY "Users can manage own brand assets"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'brand-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'brand-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- listing-photos: users can manage files in their own {user_id}/ folder
CREATE POLICY "Users can manage own listing photos"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- generated-content: users can READ their own files; server writes via service role
CREATE POLICY "Users can view own generated content"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'generated-content'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
