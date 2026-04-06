import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/types/listing";
import type { ContentPackage } from "@/types/content";

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

  // If only one completed listing, redirect straight to it
  const completed = typedListings.filter(
    (l) => l.status === "complete" || l.status === "partial_failure"
  );
  if (completed.length === 1 && typedListings.length === 1) {
    redirect(`/listings/${completed[0].id}/content`);
  }

  // Load package stats for each listing
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
            className="mt-6 inline-block rounded-lg bg-sage px-6 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
          >
            New Listing
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {listingsWithStats.map(({ listing, pkg }) => {
            const isComplete = listing.status === "complete" || listing.status === "partial_failure";
            const href = isComplete
              ? `/listings/${listing.id}/content`
              : `/listings/${listing.id}/processing`;

            return (
              <Link
                key={listing.id}
                href={href}
                className="flex items-center justify-between rounded-2xl border border-sage/20 bg-white px-6 py-5 transition-colors hover:border-sage hover:shadow-sm"
              >
                <div>
                  <p className="font-semibold text-black">{listing.address}</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {listing.city}, {listing.state} — ${listing.price.toLocaleString()}
                  </p>
                  {pkg && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {pkg.completed_pieces}/{pkg.total_pieces} pieces
                      </span>
                      {pkg.failed_pieces > 0 && (
                        <span className="text-xs text-red-500">
                          {pkg.failed_pieces} failed
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={listing.status} />
                  <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
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
