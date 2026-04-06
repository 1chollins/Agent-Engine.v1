import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ContentPackage, ContentPiece } from "@/types/content";

type ContentPageProps = {
  params: { id: string };
};

export default async function ListingContentPage({ params }: ContentPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: listing } = await supabase
    .from("listings")
    .select("id, address, city, state, status")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!listing) redirect("/dashboard");

  const { data: pkg } = await supabase
    .from("content_packages")
    .select("*")
    .eq("listing_id", params.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!pkg) redirect(`/listings/${params.id}/processing`);

  const typedPkg = pkg as ContentPackage;

  // If still processing, redirect back to processing page
  if (typedPkg.status === "processing") {
    redirect(`/listings/${params.id}/processing`);
  }

  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("package_id", typedPkg.id)
    .order("day_number");

  const typedPieces = (pieces ?? []) as ContentPiece[];

  const posts = typedPieces.filter((p) => p.content_type === "post");
  const reels = typedPieces.filter((p) => p.content_type === "reel");
  const stories = typedPieces.filter((p) => p.content_type === "story");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Content Package</h1>
          <p className="mt-1 text-gray-600">
            {listing.address}, {listing.city}, {listing.state}
          </p>
        </div>
        <PackageStatusBadge status={typedPkg.status} />
      </div>

      {/* Summary */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label="Posts" count={posts.length} completed={posts.filter((p) => p.status === "complete").length} />
        <StatCard label="Reels" count={reels.length} completed={reels.filter((p) => p.status === "complete").length} />
        <StatCard label="Stories" count={stories.length} completed={stories.filter((p) => p.status === "complete").length} />
      </div>

      {/* Content Calendar */}
      <section className="rounded-2xl border border-sage/20 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-black">
          14-Day Content Calendar
        </h2>

        <div className="space-y-3">
          {typedPieces.map((piece) => (
            <div
              key={piece.id}
              className="flex items-center justify-between rounded-lg border border-sage/10 bg-cream/50 p-4"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/20 text-sm font-bold text-sage-darker">
                  {piece.day_number}
                </span>
                <div>
                  <span className="text-sm font-medium capitalize text-black">
                    {piece.content_type}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {piece.recommended_time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {piece.asset_type && (
                  <span className="rounded bg-sage/10 px-2 py-0.5 text-xs text-sage-darker">
                    {piece.asset_type}
                  </span>
                )}
                <PieceStatusBadge status={piece.status} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg border border-sage/30 px-6 py-2 text-sm font-medium text-sage-darker hover:bg-cream"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, count, completed }: { label: string; count: number; completed: number }) {
  return (
    <div className="rounded-xl border border-sage/20 bg-white p-4 text-center">
      <p className="text-2xl font-bold text-black">
        {completed}/{count}
      </p>
      <p className="text-sm text-gray-500">{label} Complete</p>
    </div>
  );
}

function PackageStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700",
    processing: "bg-yellow-50 text-yellow-700",
    complete: "bg-green-50 text-green-700",
    partial_failure: "bg-orange-50 text-orange-700",
    failed: "bg-red-50 text-red-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${styles[status] ?? styles.pending}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function PieceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600",
    processing: "bg-yellow-50 text-yellow-700",
    complete: "bg-green-50 text-green-700",
    failed: "bg-red-50 text-red-700",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  );
}
