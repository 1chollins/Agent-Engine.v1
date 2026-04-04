# Agent Engine v1 — Data Model

**Product:** Agent Engine v1
**Owner:** Colby Hollins — Frame & Form Studio
**Date:** April 4, 2026
**Database:** Supabase (PostgreSQL)
**Auth:** Supabase Auth
**Storage:** Supabase Storage

---

## 1. Entity Relationship Overview

```
Users (Supabase Auth)
  │
  └── 1:1 ── Brand Profiles
  │
  └── 1:Many ── Listings
                   │
                   ├── 1:Many ── Listing Photos
                   │
                   ├── 1:1 ── Content Packages
                   │              │
                   │              └── 1:Many ── Content Pieces
                   │
                   └── 1:1 ── Payments
                   
Cost Logs (standalone, linked to listings)
```

**Key relationships:**
- A user has exactly one brand profile
- A user has many listings
- A listing has many photos (10–30)
- A listing has exactly one content package
- A content package has exactly 14 content pieces
- A listing has exactly one payment record
- Cost logs track every external API call, linked to listings

---

## 2. Table Definitions

### 2.1 brand_profiles

Stores the realtor's brand identity. Created once, reused across all listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Brand profile ID |
| user_id | uuid | FK → auth.users(id), UNIQUE, NOT NULL | Owning user — one profile per user |
| agent_name | text | NOT NULL | Full name (e.g., "Sarah Johnson") |
| agent_title | text | NOT NULL | Title (e.g., "Realtor", "Broker Associate") |
| brokerage_name | text | NOT NULL | Brokerage (e.g., "Keller Williams") |
| phone | text | NOT NULL | Contact phone number |
| email | text | NOT NULL | Contact email |
| website | text | NULL | Website URL |
| instagram_handle | text | NULL | Instagram @ handle |
| facebook_url | text | NULL | Facebook page URL |
| headshot_path | text | NOT NULL | Supabase Storage path in brand-assets bucket |
| logo_path | text | NOT NULL | Supabase Storage path in brand-assets bucket |
| primary_color | text | NOT NULL | Hex color code (e.g., "#2E75B6") |
| secondary_color | text | NOT NULL | Hex color code |
| accent_color | text | NULL | Hex color code (optional) |
| tone | text | NOT NULL, DEFAULT 'professional' | One of: professional, friendly, luxury, casual |
| is_complete | boolean | NOT NULL, DEFAULT false | True when all required fields are filled |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Record creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- UNIQUE on user_id (enforces one profile per user)

**Notes:**
- headshot_path and logo_path store relative paths within Supabase Storage, not full URLs. The app constructs the public URL at render time.
- is_complete is computed on save: true when all NOT NULL fields have values and headshot_path and logo_path are populated.
- tone is validated at the application layer against the four allowed values.

---

### 2.2 listings

Stores property details submitted by the realtor.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Listing ID |
| user_id | uuid | FK → auth.users(id), NOT NULL | Owning user |
| brand_profile_id | uuid | FK → brand_profiles(id), NOT NULL | Brand profile used for this listing |
| address | text | NOT NULL | Street address |
| city | text | NOT NULL | City |
| state | text | NOT NULL | State |
| zip_code | text | NOT NULL | ZIP code |
| property_type | text | NOT NULL | One of: single_family, condo, townhome, villa, multi_family, vacant_land |
| bedrooms | integer | NULL | Number of bedrooms (NULL for vacant land) |
| bathrooms | numeric(3,1) | NULL | Number of bathrooms — allows 2.5 (NULL for vacant land) |
| sqft | integer | NOT NULL | Square footage |
| lot_size | text | NULL | Lot size description (e.g., "0.25 acres") |
| price | integer | NOT NULL | Listing price in whole dollars |
| year_built | integer | NULL | Year built |
| features | text | NOT NULL | Key features, free-form (e.g., "pool, waterfront, impact windows") |
| neighborhood | text | NULL | Neighborhood or community name |
| hoa_info | text | NULL | HOA details |
| additional_notes | text | NULL | Extra selling points |
| status | text | NOT NULL, DEFAULT 'draft' | One of: draft, pending_payment, processing, complete, partial_failure, failed |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Submission timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- INDEX on user_id (user's listing lookups)
- INDEX on status (filtering by status)
- INDEX on created_at DESC (sorting by most recent)

**Notes:**
- status lifecycle: draft → pending_payment → processing → complete/partial_failure/failed
- brand_profile_id is captured at submission time so if the user later updates their brand profile, existing listings retain the brand state they were generated with
- price is stored as integer (whole dollars) to avoid floating point issues

---

### 2.3 listing_photos

Stores metadata for uploaded listing photos. Actual files live in Supabase Storage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Photo ID |
| listing_id | uuid | FK → listings(id) ON DELETE CASCADE, NOT NULL | Parent listing |
| file_path | text | NOT NULL | Supabase Storage path in listing-photos bucket |
| file_name | text | NOT NULL | Original filename |
| file_size | integer | NOT NULL | File size in bytes |
| mime_type | text | NOT NULL | MIME type (image/jpeg, image/png, image/heic) |
| width | integer | NULL | Image width in pixels (populated after server-side processing) |
| height | integer | NULL | Image height in pixels |
| sort_order | integer | NOT NULL, DEFAULT 0 | Display order (0-based) |
| is_hero | boolean | NOT NULL, DEFAULT false | True if this is the designated hero photo |
| uploaded_at | timestamptz | NOT NULL, DEFAULT now() | Upload timestamp |

**Indexes:**
- INDEX on listing_id (photo lookups by listing)
- INDEX on listing_id, sort_order (ordered retrieval)

**Constraints:**
- Only one photo per listing can have is_hero = true (enforced at application layer via transaction)
- ON DELETE CASCADE ensures photos are cleaned up when a listing is deleted

**Notes:**
- file_path is relative to the listing-photos bucket. Full path pattern: `{user_id}/{listing_id}/{filename}`
- The application must also delete the actual Storage object when a photo record is deleted

---

### 2.4 content_packages

One package per listing. Tracks the overall generation status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Package ID |
| listing_id | uuid | FK → listings(id) ON DELETE CASCADE, UNIQUE, NOT NULL | Parent listing — one package per listing |
| status | text | NOT NULL, DEFAULT 'pending' | One of: pending, processing, complete, partial_failure, failed |
| total_pieces | integer | NOT NULL, DEFAULT 14 | Total content pieces in this package |
| completed_pieces | integer | NOT NULL, DEFAULT 0 | Number of successfully generated pieces |
| failed_pieces | integer | NOT NULL, DEFAULT 0 | Number of failed pieces |
| processing_started_at | timestamptz | NULL | When generation began |
| processing_completed_at | timestamptz | NULL | When generation finished (success or failure) |
| total_cost_usd | numeric(10,4) | NULL | Total API cost for this package |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Record creation timestamp |

**Indexes:**
- UNIQUE on listing_id (one package per listing)
- INDEX on status (filtering active/completed packages)

**Notes:**
- completed_pieces + failed_pieces may be less than total_pieces while processing is in progress
- total_cost_usd is aggregated from cost_logs after generation completes

---

### 2.5 content_pieces

Individual content items within a package. Each package has exactly 14 pieces.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Piece ID |
| package_id | uuid | FK → content_packages(id) ON DELETE CASCADE, NOT NULL | Parent package |
| day_number | integer | NOT NULL | Day in the 14-day calendar (1–14) |
| content_type | text | NOT NULL | One of: post, reel, story |
| platform | text | NOT NULL | One of: instagram, facebook, both |
| status | text | NOT NULL, DEFAULT 'pending' | One of: pending, processing, complete, failed |
| retry_count | integer | NOT NULL, DEFAULT 0 | Number of generation attempts |
| asset_path | text | NULL | Supabase Storage path to the generated visual (image or video) |
| asset_path_alt | text | NULL | Alternate dimension asset path (e.g., FB-sized version of a post) |
| asset_type | text | NULL | One of: image, video |
| caption_instagram | text | NULL | Instagram-optimized caption |
| caption_facebook | text | NULL | Facebook-optimized caption |
| hashtags | text | NULL | Comma-separated or newline-separated hashtag string |
| text_overlay | text | NULL | Text overlay copy for reels (JSON array of phrases) |
| story_teaser | text | NULL | Story teaser text |
| story_cta | text | NULL | Story CTA text |
| recommended_time | text | NOT NULL | Recommended posting time (e.g., "9:00 AM") |
| source_photo_ids | uuid[] | NULL | Array of listing_photo IDs used as source material |
| error_message | text | NULL | Error details if generation failed |
| generated_at | timestamptz | NULL | When this piece completed generation |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Record creation timestamp |

**Indexes:**
- INDEX on package_id (pieces by package)
- INDEX on package_id, day_number (ordered retrieval)
- INDEX on status (filtering by generation status)

**Notes:**
- Posts have both caption_instagram and caption_facebook populated; asset_path is the IG-sized version (1080x1080), asset_path_alt is the FB-sized version (1200x630)
- Reels have both captions, plus text_overlay as a JSON array of short phrases
- Stories have story_teaser and story_cta instead of full captions; platform indicates which platform this story is optimized for
- source_photo_ids tracks which listing photos were used, preventing duplicate usage across pieces
- retry_count caps at 2 automatic retries before requiring manual retry

---

### 2.6 payments

Tracks Stripe payment records per listing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Payment ID |
| user_id | uuid | FK → auth.users(id), NOT NULL | Paying user |
| listing_id | uuid | FK → listings(id), UNIQUE, NOT NULL | Listing being paid for |
| stripe_checkout_session_id | text | NOT NULL | Stripe Checkout session ID |
| stripe_payment_intent_id | text | NULL | Stripe PaymentIntent ID (populated after payment) |
| amount_cents | integer | NOT NULL | Amount charged in cents (e.g., 9900 = $99.00) |
| currency | text | NOT NULL, DEFAULT 'usd' | Payment currency |
| status | text | NOT NULL, DEFAULT 'pending' | One of: pending, succeeded, failed, refunded |
| receipt_url | text | NULL | Stripe-hosted receipt URL |
| paid_at | timestamptz | NULL | When payment succeeded |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Record creation timestamp |

**Indexes:**
- UNIQUE on listing_id (one payment per listing)
- INDEX on user_id (user's payment history)
- INDEX on stripe_checkout_session_id (webhook lookups)

**Notes:**
- amount_cents uses integer cents to avoid floating point currency issues
- status is updated via Stripe webhook (checkout.session.completed event)
- receipt_url is provided by Stripe after successful payment

---

### 2.7 cost_logs

Tracks every external API call for COGS analysis. Not user-facing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Log entry ID |
| listing_id | uuid | FK → listings(id) ON DELETE SET NULL, NULL | Associated listing (NULL if orphaned) |
| content_piece_id | uuid | FK → content_pieces(id) ON DELETE SET NULL, NULL | Associated content piece (NULL if general) |
| service | text | NOT NULL | One of: claude, runway, kling, bannerbear, transloadit |
| endpoint | text | NOT NULL | API endpoint called |
| cost_usd | numeric(10,6) | NOT NULL | Cost of this call in USD |
| response_time_ms | integer | NULL | Response time in milliseconds |
| success | boolean | NOT NULL | Whether the call succeeded |
| error_message | text | NULL | Error details if failed |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Timestamp of the API call |

**Indexes:**
- INDEX on listing_id (cost analysis per listing)
- INDEX on service (cost analysis per service)
- INDEX on created_at (time-based queries)

**Notes:**
- This table grows fast. Consider partitioning by month or archiving after 90 days once volume justifies it.
- ON DELETE SET NULL preserves cost data even if the listing or piece is deleted.

---

## 3. Supabase Storage Buckets

### 3.1 brand-assets

| Setting | Value |
|---------|-------|
| Bucket name | brand-assets |
| Public | No |
| File size limit | 5MB |
| Allowed MIME types | image/jpeg, image/png, image/svg+xml |

**Path pattern:** `{user_id}/headshot.{ext}` and `{user_id}/logo.{ext}`

**RLS:** Users can only upload, read, update, and delete files in their own `{user_id}/` prefix.

### 3.2 listing-photos

| Setting | Value |
|---------|-------|
| Bucket name | listing-photos |
| Public | No |
| File size limit | 10MB |
| Allowed MIME types | image/jpeg, image/png, image/heic |

**Path pattern:** `{user_id}/{listing_id}/{filename}`

**RLS:** Users can only access files under their own `{user_id}/` prefix.

### 3.3 generated-content

| Setting | Value |
|---------|-------|
| Bucket name | generated-content |
| Public | No |
| File size limit | 100MB (video files can be large) |
| Allowed MIME types | image/jpeg, image/png, video/mp4 |

**Path pattern:** `{user_id}/{listing_id}/{content_type}/{day_number}-{type}.{ext}`

Example paths:
- `abc123/def456/posts/day01-post-1080x1080.jpg`
- `abc123/def456/posts/day01-post-1200x630.jpg`
- `abc123/def456/reels/day02-reel.mp4`
- `abc123/def456/stories/day03-story-ig.jpg`
- `abc123/def456/stories/day06-story-fb.jpg`

**RLS:** Users can only access files under their own `{user_id}/` prefix. Server-side functions (service role) can write to any path during content generation.

---

## 4. Row-Level Security (RLS) Policies

All tables have RLS enabled. Users can only access their own data.

### brand_profiles

```sql
-- Users can read their own brand profile
CREATE POLICY "Users can view own brand profile"
  ON brand_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own brand profile
CREATE POLICY "Users can create own brand profile"
  ON brand_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own brand profile
CREATE POLICY "Users can update own brand profile"
  ON brand_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### listings

```sql
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
```

### listing_photos

```sql
-- Access through listing ownership
CREATE POLICY "Users can view photos of own listings"
  ON listing_photos FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload photos to own listings"
  ON listing_photos FOR INSERT
  WITH CHECK (
    listing_id IN (
      SELECT id FROM listings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos of own listings"
  ON listing_photos FOR UPDATE
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos from own listings"
  ON listing_photos FOR DELETE
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE user_id = auth.uid()
    )
  );
```

### content_packages

```sql
CREATE POLICY "Users can view own content packages"
  ON content_packages FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE user_id = auth.uid()
    )
  );
```

### content_pieces

```sql
CREATE POLICY "Users can view own content pieces"
  ON content_pieces FOR SELECT
  USING (
    package_id IN (
      SELECT cp.id FROM content_packages cp
      JOIN listings l ON l.id = cp.listing_id
      WHERE l.user_id = auth.uid()
    )
  );
```

### payments

```sql
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);
```

### cost_logs

```sql
-- No user-facing RLS policies. Cost logs are accessed only via service role (server-side).
-- Users never see cost logs directly.
```

### Storage Bucket Policies

```sql
-- brand-assets bucket
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

-- listing-photos bucket
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

-- generated-content bucket (read-only for users, write via service role)
CREATE POLICY "Users can view own generated content"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'generated-content'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 5. Full SQL Schema

Copy and paste this into the Supabase SQL Editor to create all tables.

```sql
-- ============================================================
-- Agent Engine v1 — Database Schema
-- Run this in Supabase SQL Editor
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

-- Auto-update updated_at on brand_profiles
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

-- ============================================================
-- STORAGE BUCKETS (create these in Supabase dashboard)
-- ============================================================

-- Bucket: brand-assets
--   Public: false
--   File size limit: 5MB
--   Allowed MIME: image/jpeg, image/png, image/svg+xml

-- Bucket: listing-photos
--   Public: false
--   File size limit: 10MB
--   Allowed MIME: image/jpeg, image/png, image/heic

-- Bucket: generated-content
--   Public: false
--   File size limit: 100MB
--   Allowed MIME: image/jpeg, image/png, video/mp4

-- ============================================================
-- STORAGE RLS POLICIES (run after creating buckets)
-- ============================================================

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

CREATE POLICY "Users can view own generated content"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'generated-content'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 6. Data Flow Summary

### Listing Submission Flow
1. User creates brand profile → row in `brand_profiles`, files in `brand-assets` bucket
2. User fills listing form → row in `listings` (status: draft)
3. User uploads photos → rows in `listing_photos`, files in `listing-photos` bucket
4. User confirms submission → listing status → `pending_payment`
5. User pays via Stripe → row in `payments` (status: pending)
6. Stripe webhook confirms payment → payment status → `succeeded`, listing status → `processing`

### Content Generation Flow
7. System creates `content_packages` row (status: processing) and 14 `content_pieces` rows (status: pending)
8. For each piece, system calls external APIs:
   - Claude Haiku → captions, hashtags, text overlays → stored in `content_pieces` columns
   - Bannerbear → branded images → stored in `generated-content` bucket, path saved to `content_pieces.asset_path`
   - Runway/Kling → video clips → temporarily stored, then stitched via Transloadit/FFmpeg → final video in `generated-content` bucket
9. Each API call logs to `cost_logs`
10. Each piece status updates: pending → processing → complete/failed
11. Package status updates based on piece completion: processing → complete/partial_failure/failed
12. Package `total_cost_usd` aggregated from `cost_logs`

### Content Consumption Flow
13. User views `content_packages` dashboard → reads `content_pieces` ordered by `day_number`
14. User previews individual piece → reads asset from `generated-content` bucket + text columns
15. User downloads individual asset → direct Supabase Storage download
16. User downloads full package → server-side ZIP creation from `generated-content` bucket files + CSV from `content_pieces` text columns

---

*End of Data Model — Agent Engine v1*
*Next document: Backlog (backlog.md)*
