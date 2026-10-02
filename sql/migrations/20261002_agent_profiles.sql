-- Client agent profiles.
--
-- One login (the photographer) can keep several agents' branding and pick one
-- per listing, so agent A's headshot can never land on agent B's campaign.
-- The account's own profile stays the "primary" row; client agents are extra
-- rows with is_primary = false. listings.brand_profile_id already existed and
-- the image/text/video batches already read it; this lifts the
-- one-profile-per-user rule that kept it from meaning anything.

alter table public.brand_profiles
  add column if not exists is_primary boolean not null default true;

alter table public.brand_profiles
  drop constraint if exists brand_profiles_user_id_key;

create unique index if not exists brand_profiles_one_primary_per_user
  on public.brand_profiles (user_id) where is_primary;

create index if not exists brand_profiles_user_id_idx
  on public.brand_profiles (user_id);

-- Agents can be removed; the account profile cannot. Listings still pointing
-- at an agent block the delete through listings_brand_profile_id_fkey.
drop policy if exists "Users can delete own agent profiles" on public.brand_profiles;
create policy "Users can delete own agent profiles"
  on public.brand_profiles for delete
  using (auth.uid() = user_id and not is_primary);

-- A listing may only use a profile owned by the same account.
create or replace function public.listing_brand_profile_owner_check()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.brand_profile_id is not null and not exists (
    select 1 from public.brand_profiles bp
    where bp.id = new.brand_profile_id and bp.user_id = new.user_id
  ) then
    raise exception 'That agent profile does not belong to this account';
  end if;
  return new;
end;
$$;

drop trigger if exists listings_brand_profile_owner on public.listings;
create trigger listings_brand_profile_owner
  before insert or update of brand_profile_id, user_id on public.listings
  for each row execute function public.listing_brand_profile_owner_check();
