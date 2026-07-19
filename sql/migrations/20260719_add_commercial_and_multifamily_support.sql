-- Migration: support commercial and multifamily property types
--
-- NOT YET APPLIED. Apply via Supabase MCP, then update this header to record
-- the date, matching the convention used by the other migrations here.
--
-- Purpose: Listing Studio was residential-only. Both constraints below are
-- widened, never narrowed, so every existing row stays valid and this can be
-- applied to production with the current code still running.
--
-- Two separate problems are being fixed:
--
-- 1. listings.property_type had no commercial values at all.
--
-- 2. listing_photos.content_tag only allowed residential room names. The photo
--    classifier is forced to answer from the allowed list, so a warehouse
--    mezzanine was being tagged "bedroom" — and the motion prompt then asked
--    Kling for a push-in toward "the bed and headboard". The new tags give
--    commercial, multifamily and land photos somewhere honest to land.
--
--    Note that vacant_land was already a shippable property type with no land
--    tags to describe it, so land photos have been mislabelled since launch.

-- --- 1. property_type -------------------------------------------------------

alter table public.listings
  drop constraint if exists listings_property_type_check;

alter table public.listings
  add constraint listings_property_type_check
  check (property_type = any (array[
    -- residential (unchanged)
    'single_family'::text,
    'condo'::text,
    'townhome'::text,
    'villa'::text,
    'multi_family'::text,
    'vacant_land'::text,
    -- commercial (new)
    'office'::text,
    'retail'::text,
    'mixed_use'::text
  ]));

-- --- 2. content_tag ---------------------------------------------------------

alter table public.listing_photos
  drop constraint if exists listing_photos_content_tag_check;

alter table public.listing_photos
  add constraint listing_photos_content_tag_check
  check (content_tag is null or content_tag = any (array[
    -- residential (unchanged)
    'kitchen'::text,
    'bathroom'::text,
    'bedroom'::text,
    'living_room'::text,
    'dining_room'::text,
    'exterior_front'::text,
    'exterior_back'::text,
    'exterior_aerial'::text,
    'pool'::text,
    'garage'::text,
    'office'::text,
    'closet'::text,
    'hallway'::text,
    'detail_shot'::text,
    'view'::text,
    'other'::text,
    -- commercial (new)
    'lobby'::text,
    'reception'::text,
    'office_suite'::text,
    'conference_room'::text,
    'break_room'::text,
    'retail_floor'::text,
    'storefront'::text,
    'restroom'::text,
    'parking'::text,
    'building_exterior'::text,
    'signage'::text,
    'common_area'::text,
    -- multifamily (new)
    'unit_interior'::text,
    'fitness_center'::text,
    'clubhouse'::text,
    'laundry'::text,
    'courtyard'::text,
    -- land (new)
    'parcel'::text,
    'frontage'::text,
    'road_access'::text,
    'water_frontage'::text
  ]));
