-- ============================================================
-- Agent Engine v1 — Database Schema
-- Run this in Supabase SQL Editor
-- Source: docs/datamodel.md
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Brand Profiles
CREATE TABLE brand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  agent_name text NOT NULL,
  agent_title text NOT NULL,
  brokerage_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  website text,
  instagram_handle text,
  facebook_url text,
  headshot_path text NOT NULL,
  logo_path text NOT NULL,
  primary_color text NOT NULL DEFAULT '#2E75B6',
  secondary_color text NOT NULL DEFAULT '#1A1A2E',
  accent_color text,
  tone text NOT NULL DEFAULT 'professional'
    CHECK (tone IN ('professional', 'friendly', 'luxury', 'casual')),
  is_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Listings
CREATE TABLE listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_profile_id uuid REFERENCES brand_profiles(id) NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  property_type text NOT NULL
    CHECK (property_type IN ('single_family', 'condo', 'townhome', 'villa', 'multi_family', 'vacant_land')),
  bedrooms integer,
  bathrooms numeric(3,1),
  sqft integer NOT NULL,
  lot_size text,
  price integer NOT NULL,
  year_built integer,
  features text NOT NULL,
  neighborhood text,
  hoa_info text,
  additional_notes text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_payment', 'processing', 'complete', 'partial_failure', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

-- Listing Photos
CREATE TABLE listing_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL
    CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/heic')),
  width integer,
  height integer,
  sort_order integer NOT NULL DEFAULT 0,
  is_hero boolean NOT NULL DEFAULT false,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_listing_photos_listing_id ON listing_photos(listing_id);
CREATE INDEX idx_listing_photos_sort_order ON listing_photos(listing_id, sort_order);

-- Content Packages
CREATE TABLE content_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'complete', 'partial_failure', 'failed')),
  total_pieces integer NOT NULL DEFAULT 14,
  completed_pieces integer NOT NULL DEFAULT 0,
  failed_pieces integer NOT NULL DEFAULT 0,
  processing_started_at timestamptz,
  processing_completed_at timestamptz,
  total_cost_usd numeric(10,4),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_packages_status ON content_packages(status);

-- Content Pieces
CREATE TABLE content_pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES content_packages(id) ON DELETE CASCADE NOT NULL,
  day_number integer NOT NULL CHECK (day_number BETWEEN 1 AND 14),
  content_type text NOT NULL
    CHECK (content_type IN ('post', 'reel', 'story')),
  platform text NOT NULL DEFAULT 'both'
    CHECK (platform IN ('instagram', 'facebook', 'both')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
  retry_count integer NOT NULL DEFAULT 0,
  asset_path text,
  asset_path_alt text,
  asset_type text
    CHECK (asset_type IN ('image', 'video') OR asset_type IS NULL),
  caption_instagram text,
  caption_facebook text,
  hashtags text,
  text_overlay text,
  story_teaser text,
  story_cta text,
  recommended_time text NOT NULL DEFAULT '9:00 AM',
  source_photo_ids uuid[],
  error_message text,
  generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_pieces_package_id ON content_pieces(package_id);
CREATE INDEX idx_content_pieces_day ON content_pieces(package_id, day_number);
CREATE INDEX idx_content_pieces_status ON content_pieces(status);

-- Payments
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_checkout_session_id text NOT NULL,
  stripe_payment_intent_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  receipt_url text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_session ON payments(stripe_checkout_session_id);

-- Cost Logs
CREATE TABLE cost_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  content_piece_id uuid REFERENCES content_pieces(id) ON DELETE SET NULL,
  service text NOT NULL
    CHECK (service IN ('claude', 'runway', 'kling', 'bannerbear', 'transloadit')),
  endpoint text NOT NULL,
  cost_usd numeric(10,6) NOT NULL,
  response_time_ms integer,
  success boolean NOT NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cost_logs_listing_id ON cost_logs(listing_id);
CREATE INDEX idx_cost_logs_service ON cost_logs(service);
CREATE INDEX idx_cost_logs_created_at ON cost_logs(created_at);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_logs ENABLE ROW LEVEL SECURITY;

-- Brand Profiles
CREATE POLICY "Users can view own brand profile"
  ON brand_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand profile"
  ON brand_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand profile"
  ON brand_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Listings
CREATE POLICY "Users can view own listings"
  ON listings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- Listing Photos
CREATE POLICY "Users can view photos of own listings"
  ON listing_photos FOR SELECT
  USING (listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));

CREATE POLICY "Users can upload photos to own listings"
  ON listing_photos FOR INSERT
  WITH CHECK (listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));

CREATE POLICY "Users can update photos of own listings"
  ON listing_photos FOR UPDATE
  USING (listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete photos from own listings"
  ON listing_photos FOR DELETE
  USING (listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));

-- Content Packages
CREATE POLICY "Users can view own content packages"
  ON content_packages FOR SELECT
  USING (listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));

-- Content Pieces
CREATE POLICY "Users can view own content pieces"
  ON content_pieces FOR SELECT
  USING (
    package_id IN (
      SELECT cp.id FROM content_packages cp
      JOIN listings l ON l.id = cp.listing_id
      WHERE l.user_id = auth.uid()
    )
  );

-- Payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Cost Logs: no user policies — server-side only via service role

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brand_profiles_updated_at
  BEFORE UPDATE ON brand_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
