import { createServiceClient } from "@/lib/supabase/server";
import type { Listing, ListingPhoto } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";

/**
 * Property pages — the public, hosted single-listing page every campaign
 * gets ("Link in bio" finally has a destination). Slug format:
 * {address-slug}-{4-char token} — readable, shareable, unguessable.
 */

function slugifyAddress(listing: Listing): string {
  return `${listing.address} ${listing.city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function randomToken(): string {
  return Math.random().toString(36).slice(2, 6);
}

/**
 * Idempotent: returns the existing page slug or creates one. Called from
 * the pipeline's finalize step and (self-healing) from the listing
 * content page, so pre-existing campaigns get pages too.
 */
export async function ensurePropertyPage(listingId: string): Promise<string | null> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("property_pages")
    .select("slug")
    .eq("listing_id", listingId)
    .maybeSingle();
  if (existing) return existing.slug as string;

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();
  if (!listing) return null;

  const typed = listing as Listing & { user_id: string };
  // Retry on the (unlikely) slug collision with a fresh token.
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = `${slugifyAddress(typed)}-${randomToken()}`;
    const { error } = await supabase.from("property_pages").insert({
      listing_id: listingId,
      user_id: typed.user_id,
      slug,
    });
    if (!error) return slug;
    if (!error.message.includes("duplicate")) {
      // Unique violation on listing_id → another writer beat us; reuse theirs.
      const { data: raced } = await supabase
        .from("property_pages")
        .select("slug")
        .eq("listing_id", listingId)
        .maybeSingle();
      if (raced) return raced.slug as string;
      console.error("[property-page] create failed:", error.message);
      return null;
    }
  }
  return null;
}

export type PropertyPageData = {
  page: { id: string; slug: string; published: boolean };
  listing: Listing;
  brand: Pick<
    BrandProfile,
    | "agent_name"
    | "agent_title"
    | "brokerage_name"
    | "phone"
    | "email"
    | "primary_color"
    | "secondary_color"
  > & { headshotUrl: string | null; logoUrl: string | null };
  photos: { url: string; isHero: boolean }[];
  /** Signed URL of the hero reel video, if one completed. */
  reelUrl: string | null;
};

/**
 * Assembles everything the public page renders. Service client on
 * purpose: visitors are anonymous; RLS would return nothing. The slug is
 * the capability — unpublished pages return null.
 */
export async function getPropertyPageData(slug: string): Promise<PropertyPageData | null> {
  const supabase = createServiceClient();

  const { data: page } = await supabase
    .from("property_pages")
    .select("id, slug, published, listing_id, user_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!page || !page.published) return null;

  const [{ data: listing }, { data: brand }, { data: photos }] = await Promise.all([
    supabase.from("listings").select("*").eq("id", page.listing_id).single(),
    supabase.from("brand_profiles").select("*").eq("user_id", page.user_id).maybeSingle(),
    supabase
      .from("listing_photos")
      .select("file_path, is_hero, sort_order")
      .eq("listing_id", page.listing_id)
      .order("sort_order"),
  ]);
  if (!listing || !brand) return null;

  const typedBrand = brand as BrandProfile;
  const photoRows = (photos ?? []) as Pick<ListingPhoto, "file_path" | "is_hero" | "sort_order">[];

  // Batch-sign photo URLs (24h — pages are revisited from social links)
  const paths = photoRows.map((p) => p.file_path);
  const signedPhotos = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("listing-photos")
      .createSignedUrls(paths, 86400);
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) signedPhotos.set(s.path, s.signedUrl);
    }
  }

  const [headshotSigned, logoSigned] = await Promise.all([
    typedBrand.headshot_path
      ? supabase.storage.from("brand-assets").createSignedUrl(typedBrand.headshot_path, 86400)
      : Promise.resolve({ data: null }),
    typedBrand.logo_path
      ? supabase.storage.from("brand-assets").createSignedUrl(typedBrand.logo_path, 86400)
      : Promise.resolve({ data: null }),
  ]);

  // Hero reel: the day-2 Just Listed video from the latest package
  let reelUrl: string | null = null;
  const { data: pkg } = await supabase
    .from("content_packages")
    .select("id")
    .eq("listing_id", page.listing_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (pkg) {
    const { data: reel } = await supabase
      .from("content_pieces")
      .select("asset_path")
      .eq("package_id", pkg.id)
      .eq("content_type", "reel")
      .eq("status", "complete")
      .not("asset_path", "is", null)
      .order("day_number")
      .limit(1)
      .maybeSingle();
    if (reel?.asset_path) {
      const { data: signed } = await supabase.storage
        .from("generated-content")
        .createSignedUrl(reel.asset_path, 86400);
      reelUrl = signed?.signedUrl ?? null;
    }
  }

  // Fire-and-forget view counter
  void supabase.rpc("increment_property_page_views", { page_id: page.id });

  return {
    page: { id: page.id as string, slug: page.slug as string, published: true },
    listing: listing as Listing,
    brand: {
      agent_name: typedBrand.agent_name,
      agent_title: typedBrand.agent_title,
      brokerage_name: typedBrand.brokerage_name,
      phone: typedBrand.phone,
      email: typedBrand.email,
      primary_color: typedBrand.primary_color,
      secondary_color: typedBrand.secondary_color,
      headshotUrl: headshotSigned.data?.signedUrl ?? null,
      logoUrl: logoSigned.data?.signedUrl ?? null,
    },
    photos: photoRows.map((p) => ({
      url: signedPhotos.get(p.file_path) ?? "",
      isHero: p.is_hero,
    })).filter((p) => p.url),
    reelUrl,
  };
}
