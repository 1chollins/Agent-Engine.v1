import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingStatus, ListingPhoto } from "@/types/listing";
import { priceLabel } from "@/lib/audience";

const STATUS_STYLES: Record<ListingStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  pending_payment: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending Payment" },
  processing: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Processing" },
  complete: { bg: "bg-green-50", text: "text-green-700", label: "Complete" },
  partial_failure: { bg: "bg-orange-50", text: "text-orange-700", label: "Partial Failure" },
  failed: { bg: "bg-red-50", text: "text-red-700", label: "Failed" },
};

export default async function ListingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const typedListings = (listings ?? []) as Listing[];

  // Which agent each campaign is for — only worth showing once client agents exist.
  const { data: profileRows } = await supabase
    .from("brand_profiles")
    .select("id, agent_name, is_primary, profile_type")
    .eq("user_id", user.id);
  const profiles = (profileRows ?? []) as {
    id: string;
    agent_name: string;
    is_primary: boolean;
    profile_type: string | null;
  }[];
  const hostProfiles = new Set(profiles.filter((p) => p.profile_type === "host").map((p) => p.id));
  const agentNames = new Map(profiles.map((p) => [p.id, p.agent_name]));
  const showAgent = profiles.some((p) => !p.is_primary);

  // Hero thumbnail per listing (hero photo, else first by sort order)
  const thumbs = new Map<string, string>();
  if (typedListings.length > 0) {
    const { data: photos } = await supabase
      .from("listing_photos")
      .select("listing_id, file_path, is_hero, sort_order")
      .in("listing_id", typedListings.map((l) => l.id))
      .order("sort_order");

    const firstPerListing = new Map<string, string>();
    for (const p of (photos ?? []) as Pick<ListingPhoto, "listing_id" | "file_path" | "is_hero" | "sort_order">[]) {
      if (p.is_hero || !firstPerListing.has(p.listing_id)) {
        firstPerListing.set(p.listing_id, p.file_path);
      }
    }
    const paths = Array.from(firstPerListing.values());
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage
        .from("listing-photos")
        .createSignedUrls(paths, 3600);
      const byPath = new Map<string, string>(
        (signed ?? []).map((s) => [s.path ?? "", s.signedUrl])
      );
      firstPerListing.forEach((path, listingId) => {
        const url = byPath.get(path);
        if (url) thumbs.set(listingId, url);
      });
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-black sm:text-3xl">Campaigns</h1>
          <p className="mt-1 text-gray-600">
            One listing in — 14 days of posts, reels &amp; stories out.
            {typedListings.length > 0 &&
              ` ${typedListings.length} propert${typedListings.length === 1 ? "y" : "ies"} so far.`}
          </p>
        </div>
        <Link
          href="/listings/new"
          className="shrink-0 rounded-lg bg-forest px-5 py-2.5 text-center text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-forest/90"
        >
          New Campaign
        </Link>
      </div>

      {typedListings.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-gray-400">No campaigns yet</p>
          <p className="mt-2 text-sm text-gray-400">
            Upload a listing and we generate the full 14-day content package.
          </p>
          <Link
            href="/listings/new"
            className="mt-6 inline-block rounded-lg bg-forest px-6 py-2.5 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-forest/90"
          >
            New Campaign
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {typedListings.map((listing) => {
            const status = STATUS_STYLES[listing.status] ?? STATUS_STYLES.draft;
            const thumb = thumbs.get(listing.id);
            const href =
              listing.status === "draft"
                ? `/listings/new?draft=${listing.id}`
                : listing.status === "complete" || listing.status === "partial_failure"
                  ? `/listings/${listing.id}/content`
                  : listing.status === "processing"
                    ? `/listings/${listing.id}/processing`
                    : `/listings/${listing.id}/review`;

            const specs = [
              listing.bedrooms != null ? `${listing.bedrooms} bd` : null,
              listing.bathrooms != null ? `${listing.bathrooms} ba` : null,
              listing.sqft ? `${listing.sqft.toLocaleString()} sqft` : null,
            ].filter(Boolean);

            return (
              <Link
                key={listing.id}
                href={href}
                className="flex items-center gap-3 rounded-xl border border-forest/15 bg-white/60 p-3 transition-all hover:border-forest/40 hover:shadow-sm sm:gap-5 sm:pr-6"
              >
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-20 sm:w-28">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-black">{listing.address}</p>
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {listing.city}, {listing.state}
                    {showAgent && agentNames.get(listing.brand_profile_id) && (
                      <span className="text-gray-400"> · {agentNames.get(listing.brand_profile_id)}</span>
                    )}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {priceLabel(listing.price, hostProfiles.has(listing.brand_profile_id) ? "host" : "agent") && (
                      <span className="text-sm font-semibold text-forest">
                        {priceLabel(listing.price, hostProfiles.has(listing.brand_profile_id) ? "host" : "agent")}
                      </span>
                    )}
                    {specs.length > 0 && (
                      <span className="hidden text-xs text-gray-400 sm:inline">
                        {specs.join(" · ")}
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium sm:hidden ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
