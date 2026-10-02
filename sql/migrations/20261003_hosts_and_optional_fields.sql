-- Listing Studio for Airbnb hosts as well as realtors, and a lighter sign-up.
--
-- 1. Each brand profile (the account's own and every client profile) is a
--    realtor ('agent') or an Airbnb / short-term-rental host ('host').
--    Campaigns made for a host profile use host wording: "Now booking",
--    nightly rate, "Book your stay", and the host's booking link.
-- 2. Only name, email and phone are required on a profile, and only the
--    address on a listing. Headshot, logo, title, brokerage, price, sq ft,
--    features and property type become optional; renders and captions skip
--    whatever is blank.
--
-- Safe to run more than once. Existing rows are untouched (all profiles stay
-- 'agent').

alter table public.brand_profiles
  add column if not exists profile_type text not null default 'agent',
  add column if not exists booking_url text;

alter table public.brand_profiles
  drop constraint if exists brand_profiles_profile_type_check;
alter table public.brand_profiles
  add constraint brand_profiles_profile_type_check
  check (profile_type in ('agent', 'host'));

alter table public.brand_profiles
  alter column agent_title drop not null,
  alter column brokerage_name drop not null,
  alter column headshot_path drop not null,
  alter column logo_path drop not null;

-- How many guests a rental sleeps (host listings only).
alter table public.listings
  add column if not exists max_guests integer;

alter table public.listings
  alter column property_type drop not null,
  alter column sqft drop not null,
  alter column price drop not null,
  alter column features drop not null;

comment on column public.brand_profiles.profile_type is
  'agent = realtor campaigns (Just listed, price, showings); host = short-term rental campaigns (Now booking, nightly rate, book your stay).';
comment on column public.brand_profiles.booking_url is
  'Host profiles: Airbnb / VRBO / direct booking link used in captions and the property page.';
comment on column public.listings.price is
  'Sale price for realtor listings; nightly rate for host listings. Optional.';
