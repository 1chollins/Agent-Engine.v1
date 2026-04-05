-- ============================================================
-- Agent Engine v1 — Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
--
-- Prerequisites:
--   1. Create a test user in Supabase Auth (Dashboard > Authentication > Users)
--   2. Copy the user's UUID and replace the placeholder below
-- ============================================================

-- Replace this with your actual test user UUID from Supabase Auth
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- ← REPLACE THIS
  brand_id uuid;
  listing_id uuid;
  package_id uuid;
BEGIN

-- Brand Profile
INSERT INTO brand_profiles (
  id, user_id, agent_name, agent_title, brokerage_name,
  phone, email, website, instagram_handle, facebook_url,
  headshot_path, logo_path, primary_color, secondary_color, accent_color,
  tone, is_complete
) VALUES (
  gen_random_uuid(), test_user_id, 'Colby Hollins', 'Realtor', 'Frame & Form Studio',
  '(239) 555-0100', 'colby@frameandform.com', 'https://frameandform.com',
  '@colbyhollins', 'https://facebook.com/colbyhollins',
  test_user_id || '/headshot.jpg', test_user_id || '/logo.png',
  '#2E75B6', '#1A1A2E', '#F0A500',
  'professional', true
) RETURNING id INTO brand_id;

-- Listing
INSERT INTO listings (
  id, user_id, brand_profile_id, address, city, state, zip_code,
  property_type, bedrooms, bathrooms, sqft, lot_size, price,
  year_built, features, neighborhood, hoa_info, additional_notes, status
) VALUES (
  gen_random_uuid(), test_user_id, brand_id,
  '1842 SW 25th Terrace', 'Cape Coral', 'FL', '33914',
  'single_family', 4, 3.0, 2150, '0.25 acres', 459900,
  2005, 'heated pool, updated kitchen with quartz countertops, impact windows, new roof 2023, canal access with boat dock',
  'Pelican', NULL, 'Gulf access via canal. Minutes to Tarpon Point Marina.',
  'complete'
) RETURNING id INTO listing_id;

-- Content Package
INSERT INTO content_packages (
  id, listing_id, status, total_pieces, completed_pieces, failed_pieces,
  processing_started_at, processing_completed_at, total_cost_usd
) VALUES (
  gen_random_uuid(), listing_id, 'complete', 14, 14, 0,
  now() - interval '8 minutes', now(), 23.5000
) RETURNING id INTO package_id;

-- Content Pieces (14 total: 5 posts, 5 reels, 4 stories)
-- Day 1: Static Post
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, caption_instagram, caption_facebook, hashtags, recommended_time)
VALUES (package_id, 1, 'post', 'both', 'complete', 'image',
  'Welcome to 1842 SW 25th Terrace — where Florida living meets smart investment.',
  'If you''ve been dreaming of a Cape Coral home with waterfront access, this is the one.',
  '#CapeCoralRealEstate #FloridaHomes #WaterfrontLiving #PoolHome #CanalAccess',
  '9:00 AM');

-- Day 2: Video Reel
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, caption_instagram, caption_facebook, hashtags, text_overlay, recommended_time)
VALUES (package_id, 2, 'reel', 'both', 'complete', 'video',
  'Take a virtual tour of this stunning Cape Coral waterfront home.',
  'Step inside this beautiful 4-bed, 3-bath home in the Pelican area.',
  '#CapeCoralRealEstate #HomeTour #WaterfrontLiving #FloridaHomes',
  '["4 Bed / 3 Bath", "$459,900", "Heated Pool", "Canal Access", "New Roof 2023"]',
  '12:00 PM');

-- Day 3: Story
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, story_teaser, story_cta, recommended_time)
VALUES (package_id, 3, 'story', 'instagram', 'complete', 'image',
  'New listing alert! Waterfront dream in Cape Coral.',
  'DM for showing details',
  '6:00 PM');

-- Day 4: Static Post
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, caption_instagram, caption_facebook, hashtags, recommended_time)
VALUES (package_id, 4, 'post', 'both', 'complete', 'image',
  'This kitchen was made for entertaining. Quartz countertops and modern finishes throughout.',
  'The heart of this home? A beautifully updated kitchen with quartz countertops.',
  '#KitchenGoals #QuartzCountertops #CapeCoralHomes #FloridaRealEstate',
  '9:00 AM');

-- Day 5: Video Reel
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, caption_instagram, caption_facebook, hashtags, text_overlay, recommended_time)
VALUES (package_id, 5, 'reel', 'both', 'complete', 'video',
  'From the pool to the dock — outdoor living at its finest.',
  'Imagine relaxing by your heated pool, then walking to your private boat dock.',
  '#OutdoorLiving #PoolLife #BoatDock #CapeCoralFL',
  '["Heated Pool", "Boat Dock", "Canal Access", "Gulf Access"]',
  '12:00 PM');

-- Day 6: Story
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, story_teaser, story_cta, recommended_time)
VALUES (package_id, 6, 'story', 'facebook', 'complete', 'image',
  '$459,900 — waterfront with boat dock in Cape Coral.',
  'Link in bio for details',
  '6:00 PM');

-- Day 7: Static Post
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, caption_instagram, caption_facebook, hashtags, recommended_time)
VALUES (package_id, 7, 'post', 'both', 'complete', 'image',
  'Impact windows, new roof, and peace of mind. This home is built to last.',
  'Smart upgrades that protect your investment — impact windows and a brand new roof.',
  '#ImpactWindows #NewRoof #SmartInvestment #CapeCoralRealEstate',
  '9:00 AM');

-- Day 8: Video Reel
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, caption_instagram, caption_facebook, hashtags, text_overlay, recommended_time)
VALUES (package_id, 8, 'reel', 'both', 'complete', 'video',
  'Every room tells a story. 2,150 sqft of thoughtfully designed living space.',
  'Walk through 2,150 square feet of beautifully maintained space.',
  '#InteriorDesign #HomeTour #CapeCoralHomes #FloridaLiving',
  '["2,150 Sq Ft", "4 Bedrooms", "3 Bathrooms", "Updated Finishes"]',
  '12:00 PM');

-- Day 9: Story
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, story_teaser, story_cta, recommended_time)
VALUES (package_id, 9, 'story', 'instagram', 'complete', 'image',
  'Pelican area gem — won''t last long at this price.',
  'Tap to learn more',
  '6:00 PM');

-- Day 10: Static Post
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, caption_instagram, caption_facebook, hashtags, recommended_time)
VALUES (package_id, 10, 'post', 'both', 'complete', 'image',
  'Location matters. The Pelican area offers canal access, community, and convenience.',
  'Why Pelican? Canal access, great neighbors, and minutes from everything Cape Coral offers.',
  '#PelicanCapeCoral #LocationMatters #CapeCoralLiving #SWFLRealEstate',
  '9:00 AM');

-- Day 11: Video Reel
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, caption_instagram, caption_facebook, hashtags, text_overlay, recommended_time)
VALUES (package_id, 11, 'reel', 'both', 'complete', 'video',
  'Sun, water, and home. This is the Florida lifestyle you''ve been looking for.',
  'Florida living doesn''t get better than this. Sun, water, and a home built for it.',
  '#FloridaLifestyle #WaterfrontLiving #SunshineState #CapeCoralFL',
  '["Florida Living", "Waterfront", "$459,900", "Cape Coral"]',
  '12:00 PM');

-- Day 12: Story
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, story_teaser, story_cta, recommended_time)
VALUES (package_id, 12, 'story', 'facebook', 'complete', 'image',
  'Last chance — schedule your showing this weekend.',
  'DM for availability',
  '6:00 PM');

-- Day 13: Static Post
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, caption_instagram, caption_facebook, hashtags, recommended_time)
VALUES (package_id, 13, 'post', 'both', 'complete', 'image',
  'Your next chapter starts at 1842 SW 25th Terrace. Are you ready?',
  'This could be your next address. 4 beds, 3 baths, pool, dock — all for $459,900.',
  '#DreamHome #CapeCoralRealEstate #JustListed #FloridaHomes #OpenHouse',
  '9:00 AM');

-- Day 14: Video Reel
INSERT INTO content_pieces (package_id, day_number, content_type, platform, status, asset_type, caption_instagram, caption_facebook, hashtags, text_overlay, recommended_time)
VALUES (package_id, 14, 'reel', 'both', 'complete', 'video',
  'One more look before it''s gone. 1842 SW 25th Terrace, Cape Coral.',
  'Final walkthrough — this Cape Coral waterfront home is priced to move.',
  '#FinalLook #CapeCoralRealEstate #WaterfrontHome #FloridaLiving',
  '["Final Look", "1842 SW 25th Terrace", "$459,900", "Schedule Your Showing"]',
  '12:00 PM');

RAISE NOTICE 'Seed data inserted: brand_id=%, listing_id=%, package_id=%', brand_id, listing_id, package_id;

END $$;
