import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/types/listing";
import type { ContentPackage } from "@/types/content";

const PREVIEW_COUNT = 7;

type PiecePreview = {
  package_id: string;
  day_number: number;
  content_type: string;
  asset_type: string | null;
  asset_path: string | null;
  url: string | null;
};

export default async function ContentPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get all listings with content packages
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["complete", "partial_failure", "processing"])
    .order("updated_at", { ascending: false });

  const typedListings = (listings ?? []) as Listing[];

  // Load the latest package per listing
  const listingsWithStats = await Promise.all(
    typedListings.map(async (listing) => {
      const { data: pkg } = await supabase
        .from("content_packages")
        .select("id, status, completed_pieces, failed_pieces, total_pieces")
        .eq("listing_id", listing.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return { listing, pkg: pkg as ContentPackage | null };
    })
  );

  // One query for all preview pieces, then batch-sign the asset URLs
  const packageIds = listingsWithStats
    .map(({ pkg }) => pkg?.id)
    .filter((id): id is string => Boolean(id));

  const previews = new Map<string, PiecePreview[]>();
  if (packageIds.length > 0) {
    const { data: pieces } = await supabase
      .from("content_pieces")
      .select("package_id, day_number, content_type, asset_type, asset_path")
      .in("package_id", packageIds)
      .eq("status", "complete")
      .not("asset_path", "is", null)
      .order("day_number");

    const grouped = new Map<string, PiecePreview[]>();
    for (const piece of (pieces ?? []) as PiecePreview[]) {
      const list = grouped.get(piece.package_id) ?? [];
      if (list.length < PREVIEW_COUNT) {
        list.push({ ...piece, url: null });
        grouped.set(piece.package_id, list);
      }
    }

    const allPaths = Array.from(grouped.values())
      .flat()
      .map((p) => p.asset_path)
      .filter((p): p is string => Boolean(p));

    if (allPaths.length > 0) {
      const { data: signed } = await supabase.storage
        .from("generated-content")
        .createSignedUrls(allPaths, 3600);
      const byPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
      for (const list of grouped.values()) {
        for (const piece of list) {
          piece.url = piece.asset_path ? (byPath.get(piece.asset_path) ?? null) : null;
        }
      }
    }
    for (const [pkgId, list] of grouped) previews.set(pkgId, list);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black sm:text-3xl">Content</h1>
          <p className="mt-1 text-gray-600">Your generated content packages.</p>
        </div>
      </div>

      {listingsWithStats.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-gray-400">No content yet</p>
          <p className="mt-2 text-sm text-gray-400">
            Submit a listing and complete payment to generate your first content package.
          </p>
          <Link
            href="/listings/new"
            className="mt-6 inline-block rounded-lg bg-forest px-6 py-2.5 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-forest/90"
          >
            New Listing
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {listingsWithStats.map(({ listing, pkg }) => {
            const isComplete =
              listing.status === "complete" || listing.status === "partial_failure";
            const href = isComplete
              ? `/listings/${listing.id}/content`
              : `/listings/${listing.id}/processing`;
            const pieces = pkg ? (previews.get(pkg.id) ?? []) : [];
            const remaining = pkg
              ? Math.max(0, pkg.completed_pieces - pieces.length)
              : 0;

            return (
              <Link
                key={listing.id}
                href={href}
                className="block rounded-2xl border border-forest/15 bg-white/60 p-5 transition-all hover:border-forest/40 hover:shadow-sm"
              >
                {/* Property header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-heading text-lg font-semibold text-ink">
                      {listing.address}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {listing.city}, {listing.state} · ${listing.price.toLocaleString()}
                      {pkg && (
                        <span className="ml-2 text-xs text-gray-400">
                          {pkg.completed_pieces}/{pkg.total_pieces} pieces
                          {pkg.failed_pieces > 0 && (
                            <span className="text-red-500"> · {pkg.failed_pieces} failed</span>
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={listing.status} />
                    <span className="hidden text-sm font-medium text-forest sm:block">
                      Open calendar →
                    </span>
                  </div>
                </div>

                {/* Content strip */}
                {pieces.length > 0 ? (
                  <div className="mt-4 flex gap-2 overflow-hidden">
                    {pieces.map((piece) => (
                      <div
                        key={`${piece.package_id}-${piece.day_number}`}
                        className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-gray-100"
                      >
                        {piece.url ? (
                          piece.asset_type === "video" ? (
                            <video
                              src={`${piece.url}#t=0.1`}
                              preload="metadata"
                              muted
                              playsInline
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={piece.url}
                              alt={`Day ${piece.day_number}`}
                              className="h-full w-full object-cover"
                            />
                          )
                        ) : null}
                        <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1 py-0.5 text-[9px] font-medium text-white">
                          Day {piece.day_number}
                        </span>
                        {piece.asset_type === "video" && (
                          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/80">
                            <svg className="ml-px h-2.5 w-2.5 text-ink" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        )}
                      </div>
                    ))}
                    {remaining > 0 && (
                      <div className="flex h-24 w-[4.5rem] shrink-0 items-center justify-center rounded-lg border border-dashed border-forest/25 text-xs font-medium text-forest/70">
                        +{remaining} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-tan/40 bg-tan/10 px-4 py-3">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-tan" />
                    <p className="text-sm text-ink/70">
                      Content is generating — open to watch progress.
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    processing: "bg-yellow-50 text-yellow-700",
    complete: "bg-green-50 text-green-700",
    partial_failure: "bg-orange-50 text-orange-700",
    failed: "bg-red-50 text-red-700",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
