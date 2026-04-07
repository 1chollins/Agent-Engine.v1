import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProcessingStatus } from "@/components/processing-status";
import type { ContentPackage, ContentPiece } from "@/types/content";

type ProcessingPageProps = {
  params: { id: string };
};

export default async function ProcessingPage({ params }: ProcessingPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: listing } = await supabase
    .from("listings")
    .select("id, address, city, state, status")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!listing) redirect("/listings");

  const { data: pkg } = await supabase
    .from("content_packages")
    .select("*")
    .eq("listing_id", params.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("id, day_number, content_type, status, error_message, asset_type")
    .eq("package_id", pkg?.id ?? "")
    .order("day_number");

  const typedPkg = pkg as ContentPackage | null;
  const typedPieces = (pieces ?? []) as Pick<
    ContentPiece,
    "id" | "day_number" | "content_type" | "status" | "error_message" | "asset_type"
  >[];

  const { data: payment } = await supabase
    .from("payments")
    .select("amount_cents, receipt_url, paid_at")
    .eq("listing_id", params.id)
    .eq("status", "succeeded")
    .single();

  // If already complete, redirect to content view
  if (typedPkg?.status === "complete") {
    redirect(`/listings/${params.id}/content`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-black sm:text-3xl">
        Generating Content
      </h1>
      <p className="mb-8 text-gray-600">
        {listing.address}, {listing.city}, {listing.state}
      </p>

      {/* Payment Confirmation */}
      {payment && (
        <section className="mb-6 rounded-2xl border border-sage/20 bg-white p-6">
          <h2 className="text-sm font-semibold text-black">Payment Confirmed</h2>
          <p className="mt-1 text-sm text-gray-600">
            ${(payment.amount_cents / 100).toFixed(2)} charged on{" "}
            {payment.paid_at
              ? new Date(payment.paid_at).toLocaleDateString()
              : "processing"}
          </p>
          {payment.receipt_url && (
            <a
              href={payment.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-sm text-sage-darker underline hover:text-black"
            >
              View receipt
            </a>
          )}
        </section>
      )}

      {/* Status Section */}
      <section className="rounded-2xl border border-sage/20 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Content Package</h2>
          <PackageStatusBadge status={typedPkg?.status ?? "pending"} />
        </div>

        {!typedPkg && (
          <div className="mb-4 rounded-lg border border-sage/20 bg-cream p-4">
            <p className="text-sm text-gray-600">
              Your content package is being prepared. This page will update automatically.
            </p>
          </div>
        )}

        {typedPkg && (
          <ProcessingStatus
            packageId={typedPkg.id}
            listingId={params.id}
            initialPackage={{
              id: typedPkg.id,
              status: typedPkg.status,
              total_pieces: typedPkg.total_pieces,
              completed_pieces: typedPkg.completed_pieces,
              failed_pieces: typedPkg.failed_pieces,
            }}
            initialPieces={typedPieces}
          />
        )}
      </section>

      <div className="mt-8 text-center">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-sage-darker hover:text-black"
        >
          Back to Dashboard
        </Link>
      </div>
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
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? styles.pending}`}>
      {status.replace("_", " ")}
    </span>
  );
}
