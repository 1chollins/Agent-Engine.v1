import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingStatus, ListingPhoto } from "@/types/listing";

const STATUS_STYLES: Record<ListingStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  pending_payment: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending Payment" },
  processing: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Processing" },
  complete: { bg: "bg-green-50", text: "text-green-700", label: "Complete" },
  partial_failure: { bg: "bg-orange-50", text: "text-orange-700", label: "Partial Failure" },
  failed: { bg: "bg-red-50", text: "text-red-700", label: "Failed" },
};

function listingHref(listing: Listing): string {
  return listing.status === "draft"
    ? `/listings/new?draft=${listing.id}`
    : listing.status === "complete" || listing.status === "partial_failure"
      ? `/listings/${listing.id}/content`
      : listing.status === "processing"
        ? `/listings/${listing.id}/processing`
        : `/listings/${listing.id}/review`;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Stats (RLS scopes every table to this user)
  const [
    { count: listingCount },
    { count: packageCount },
    { count: pieceCount },
    { count: videoCount },
    { data: listings },
    { data: brand },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("content_packages").select("*", { count: "exact", head: true }).eq("status", "complete"),
    supabase.from("content_pieces").select("*", { count: "exact", head: true }).eq("status", "complete"),
    supabase
      .from("content_pieces")
      .select("*", { count: "exact", head: true })
      .eq("status", "complete")
      .eq("asset_type", "video"),
    supabase
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase.from("brand_profiles").select("agent_name").eq("user_id", user.id).maybeSingle(),
  ]);

  const typedListings = (listings ?? []) as Listing[];
  const inFlight = typedListings.filter((l) => l.status === "processing").length;
  const firstName =
    ((brand as { agent_name?: string } | null)?.agent_name ?? "").split(" ")[0] || null;

  // Hero thumbnails for the recent listings
  const thumbs = new Map<string, string>();
  if (typedListings.length > 0) {
    const { data: photos } = await supabase
      .from("listing_photos")
      .select("listing_id, file_path, is_hero, sort_order")
      .in("listing_id", typedListings.map((l) => l.id))
      .order("sort_order");

    const firstPerListing = new Map<string, string>();
    for (const p of (photos ?? []) as Pick<ListingPhoto, "listing_id" | "file_path" | "is_hero" | "sort_order">[]) {
      // First photo by sort_order wins unless a hero photo overrides it.
      if (p.is_hero || !firstPerListing.has(p.listing_id)) {
        firstPerListing.set(p.listing_id, p.file_path);
      }
    }
    const paths = Array.from(firstPerListing.values());
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage
        .from("listing-photos")
        .createSignedUrls(paths, 3600);
      const byPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
      for (const [listingId, path] of firstPerListing) {
        const url = byPath.get(path);
        if (url) thumbs.set(listingId, url);
      }
    }
  }

  const stats = [
    { label: "Listings", value: listingCount ?? 0, sub: inFlight > 0 ? `${inFlight} generating now` : "all time" },
    { label: "Packages Delivered", value: packageCount ?? 0, sub: "14 pieces each" },
    { label: "Content Pieces", value: pieceCount ?? 0, sub: "posts, reels & stories" },
    { label: "Videos Rendered", value: videoCount ?? 0, sub: "reels & stories" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-tan">
            Frame &amp; Form Studio
          </p>
          <h1 className="mt-1 text-2xl font-bold text-black sm:text-3xl">
            {firstName ? `Welcome back, ${firstName}.` : "Dashboard"}
          </h1>
        </div>
        <Link
          href="/listings/new"
          className="rounded-lg bg-forest px-5 py-2.5 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-forest/90"
        >
          New Listing
        </Link>
      </div>

      {/* Stat cards */}
      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-forest/15 bg-white/60 p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-ink/50">
              {s.label}
            </p>
            <p className="mt-2 font-heading text-4xl font-semibold text-forest">
              {s.value.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-ink/45">{s.sub}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">Recent Listings</h2>
            {typedListings.length > 0 && (
              <Link href="/listings" className="text-sm text-forest hover:text-black">
                View all
              </Link>
            )}
          </div>

          {typedListings.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-forest/15 bg-white/60 p-10 text-center">
              <p className="text-gray-400">No listings yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Create your first listing to generate a content package.
              </p>
              <Link
                href="/listings/new"
                className="mt-4 inline-block rounded-lg bg-forest px-6 py-2.5 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-forest/90"
              >
                New Listing
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-2.5">
              {typedListings.map((listing) => {
                const status = STATUS_STYLES[listing.status] ?? STATUS_STYLES.draft;
                const thumb = thumbs.get(listing.id);
                return (
                  <Link
                    key={listing.id}
                    href={listingHref(listing)}
                    className="flex items-center gap-4 rounded-xl border border-forest/15 bg-white/60 px-4 py-3 transition-all hover:border-forest/40 hover:shadow-sm"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-black">
                        {listing.address}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {listing.city}, {listing.state} · ${listing.price.toLocaleString()}
                      </p>
                    </div>
                    <span className="hidden text-xs text-gray-400 sm:block">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="text-lg font-semibold text-black">Quick Actions</h2>
          <div className="mt-4 space-y-2.5">
            <Link
              href="/listings/new"
              className="flex items-center justify-between rounded-xl bg-forest px-5 py-4 text-sm font-semibold text-cream transition-colors hover:bg-forest/90"
            >
              Start a new listing
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/content"
              className="flex items-center justify-between rounded-xl border border-forest/15 bg-white/60 px-5 py-4 text-sm font-medium text-ink transition-colors hover:border-forest/40"
            >
              Browse your content
              <span aria-hidden className="text-ink/40">→</span>
            </Link>
            <Link
              href="/settings/brand"
              className="flex items-center justify-between rounded-xl border border-forest/15 bg-white/60 px-5 py-4 text-sm font-medium text-ink transition-colors hover:border-forest/40"
            >
              Update brand profile
              <span aria-hidden className="text-ink/40">→</span>
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-tan/40 bg-tan/10 p-5">
            <p className="font-heading text-base font-semibold text-ink">
              14 days of content per listing
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
              Every package includes 5 branded posts, 5 video reels, and
              4 stories — captioned, scheduled, and ready to download.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
