import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingStatus } from "@/types/listing";

const STATUS_STYLES: Record<ListingStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  pending_payment: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending Payment" },
  processing: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Processing" },
  complete: { bg: "bg-green-50", text: "text-green-700", label: "Complete" },
  partial_failure: { bg: "bg-orange-50", text: "text-orange-700", label: "Partial Failure" },
  failed: { bg: "bg-red-50", text: "text-red-700", label: "Failed" },
};

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const typedListings = (listings ?? []) as Listing[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome to Agent Engine.
          </p>
        </div>
        <Link
          href="/listings/new"
          className="rounded-lg bg-sage px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
        >
          New Listing
        </Link>
      </div>

      {/* Recent Listings */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Recent Listings</h2>
          {typedListings.length > 0 && (
            <Link href="/listings" className="text-sm text-sage-darker hover:text-black">
              View all
            </Link>
          )}
        </div>

        {typedListings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-sage/20 bg-white p-10 text-center">
            <p className="text-gray-400">No listings yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Create your first listing to generate a content package.
            </p>
            <Link
              href="/listings/new"
              className="mt-4 inline-block rounded-lg bg-sage px-6 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
            >
              New Listing
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {typedListings.map((listing) => {
              const status = STATUS_STYLES[listing.status] ?? STATUS_STYLES.draft;
              const href = listing.status === "draft"
                ? `/listings/new?draft=${listing.id}`
                : `/listings/${listing.id}/review`;

              return (
                <Link
                  key={listing.id}
                  href={href}
                  className="flex items-center justify-between rounded-xl border border-sage/20 bg-white px-6 py-4 transition-colors hover:border-sage"
                >
                  <div>
                    <p className="font-medium text-black">{listing.address}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {listing.city}, {listing.state} — ${listing.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
