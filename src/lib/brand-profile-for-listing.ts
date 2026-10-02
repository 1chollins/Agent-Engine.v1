import type { SupabaseClient } from "@supabase/supabase-js";
import type { BrandProfile } from "@/types/brand-profile";

/**
 * The branding a listing's content wears.
 *
 * One login can hold several agents' profiles (the account's own "primary"
 * profile plus client agents), so the listing's brand_profile_id is the
 * source of truth — never "the profile for this user". Listings saved before
 * agent profiles existed fall back to the account's primary profile.
 */
export async function getBrandProfileForListing(
  supabase: SupabaseClient,
  listing: { user_id: string; brand_profile_id?: string | null }
): Promise<BrandProfile | null> {
  if (listing.brand_profile_id) {
    const { data } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("id", listing.brand_profile_id)
      .eq("user_id", listing.user_id)
      .maybeSingle();
    if (data) return data as BrandProfile;
  }

  const { data } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("user_id", listing.user_id)
    .eq("is_primary", true)
    .maybeSingle();
  return (data as BrandProfile | null) ?? null;
}
