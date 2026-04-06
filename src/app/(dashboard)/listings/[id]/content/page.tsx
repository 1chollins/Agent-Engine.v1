import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ContentCalendar } from "@/components/content/content-calendar";
import { ListingSelector } from "@/components/content/listing-selector";
import type { ContentPackage, ContentPiece } from "@/types/content";
import type { Listing } from "@/types/listing";

type ContentPageProps = {
  params: { id: string };
};

export default async function ListingContentPage({ params }: ContentPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Load current listing
  const { data: listing } = await supabase
    .from("listings")
    .select("id, address, city, state, status")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!listing) redirect("/dashboard");

  // Load all user listings for selector
  const { data: allListings } = await supabase
    .from("listings")
    .select("id, address, city, state, status")
    .eq("user_id", user.id)
    .in("status", ["complete", "partial_failure", "processing"])
    .order("created_at", { ascending: false });

  const selectorListings = (allListings ?? []).map((l) => ({
    id: l.id as string,
    address: l.address as string,
    city: l.city as string,
    state: l.state as string,
    status: l.status as string,
  }));

  // Load package
  const { data: pkg } = await supabase
    .from("content_packages")
    .select("*")
    .eq("listing_id", params.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!pkg) redirect(`/listings/${params.id}/processing`);
  const typedPkg = pkg as ContentPackage;

  if (typedPkg.status === "processing") {
    redirect(`/listings/${params.id}/processing`);
  }

  // Load pieces
  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("package_id", typedPkg.id)
    .order("day_number");

  const typedPieces = (pieces ?? []) as ContentPiece[];

  // Generate signed URLs for all assets
  const piecesWithUrls = await Promise.all(
    typedPieces.map(async (piece) => {
      let assetUrl: string | null = null;
      let assetAltUrl: string | null = null;

      if (piece.asset_path) {
        const { data } = await supabase.storage
          .from("generated-content")
          .createSignedUrl(piece.asset_path, 3600);
        assetUrl = data?.signedUrl ?? null;
      }

      if (piece.asset_path_alt) {
        const { data } = await supabase.storage
          .from("generated-content")
          .createSignedUrl(piece.asset_path_alt, 3600);
        assetAltUrl = data?.signedUrl ?? null;
      }

      return {
        id: piece.id,
        day_number: piece.day_number,
        content_type: piece.content_type,
        platform: piece.platform,
        status: piece.status,
        asset_type: piece.asset_type,
        asset_url: assetUrl,
        asset_alt_url: assetAltUrl,
        caption_instagram: piece.caption_instagram,
        caption_facebook: piece.caption_facebook,
        hashtags: piece.hashtags,
        text_overlay: piece.text_overlay,
        story_teaser: piece.story_teaser,
        story_cta: piece.story_cta,
        recommended_time: piece.recommended_time,
      };
    })
  );

  const posts = typedPieces.filter((p) => p.content_type === "post");
  const reels = typedPieces.filter((p) => p.content_type === "reel");
  const stories = typedPieces.filter((p) => p.content_type === "story");
  const completedCount = typedPieces.filter((p) => p.status === "complete").length;
  const failedCount = typedPieces.filter((p) => p.status === "failed").length;
  const listingAddress = `${listing.address}, ${listing.city}, ${listing.state}`;
  const isDownloadable = completedCount > 0 && (typedPkg.status as string) !== "processing";

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-black sm:text-3xl">Content Package</h1>
          <p className="mt-1 text-gray-600">{listingAddress}</p>
        </div>
        <div className="flex items-center gap-3">
          <PackageStatusBadge status={typedPkg.status} />
          {isDownloadable && (
            <a
              href={`/api/packages/${typedPkg.id}/download`}
              className="inline-flex items-center gap-2 rounded-lg bg-sage px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All
            </a>
          )}
        </div>
      </div>

      {/* Listing selector */}
      {selectorListings.length > 1 && (
        <div className="mb-6 max-w-sm">
          <ListingSelector listings={selectorListings} currentId={params.id} />
        </div>
      )}

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={`${completedCount}/${typedPkg.total_pieces}`} sub="pieces complete" />
        <StatCard
          label="Posts"
          value={`${posts.filter((p) => p.status === "complete").length}/${posts.length}`}
          sub="1080x1080 + 1200x630"
        />
        <StatCard
          label="Reels"
          value={`${reels.filter((p) => p.status === "complete").length}/${reels.length}`}
          sub="1080x1920 video"
        />
        <StatCard
          label="Stories"
          value={`${stories.filter((p) => p.status === "complete").length}/${stories.length}`}
          sub="1080x1920 image"
        />
      </div>

      {/* Failed pieces warning */}
      {failedCount > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3">
          <p className="text-sm text-red-700">
            <span className="font-semibold">{failedCount} piece{failedCount > 1 ? "s" : ""} failed.</span>{" "}
            You can retry from the{" "}
            <Link
              href={`/listings/${params.id}/processing`}
              className="font-medium underline hover:text-red-900"
            >
              processing page
            </Link>.
          </p>
        </div>
      )}

      {/* Calendar */}
      <section className="rounded-2xl border border-sage/20 bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">14-Day Content Calendar</h2>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded border border-blue-200 bg-blue-50" />
              Post
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded border border-purple-200 bg-purple-50" />
              Reel
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded border border-amber-200 bg-amber-50" />
              Story
            </span>
          </div>
        </div>

        <ContentCalendar pieces={piecesWithUrls} listingAddress={listingAddress} />
      </section>

      {/* Tips */}
      <section className="mt-6 rounded-2xl border border-sage/10 bg-cream/50 p-6">
        <h3 className="text-sm font-semibold text-black">Posting Tips</h3>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          <li>Click any piece to preview captions and copy them to clipboard</li>
          <li>Download individual assets or use &quot;Download All&quot; for a ZIP with everything</li>
          <li>Post at the recommended times for maximum engagement</li>
          <li>The ZIP includes a content-calendar.csv with all captions for easy reference</li>
        </ul>
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

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-sage/20 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-black">{value}</p>
      <p className="text-xs text-gray-500">{sub}</p>
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
