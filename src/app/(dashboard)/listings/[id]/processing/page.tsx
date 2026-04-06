import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
    .single();

  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("package_id", pkg?.id ?? "")
    .order("day_number");

  const typedPkg = pkg as ContentPackage | null;
  const typedPieces = (pieces ?? []) as ContentPiece[];

  const { data: payment } = await supabase
    .from("payments")
    .select("amount_cents, receipt_url, paid_at")
    .eq("listing_id", params.id)
    .eq("status", "succeeded")
    .single();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold text-black">
        {typedPkg?.status === "complete" ? "Content Ready" : "Generating Content"}
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

      {/* Package Status */}
      <section className="rounded-2xl border border-sage/20 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Content Package</h2>
          <PackageStatusBadge status={typedPkg?.status ?? "pending"} />
        </div>

        {typedPkg && (
          <p className="mt-2 text-sm text-gray-600">
            {typedPkg.completed_pieces} of {typedPkg.total_pieces} pieces complete
            {typedPkg.failed_pieces > 0 && ` (${typedPkg.failed_pieces} failed)`}
          </p>
        )}

        {/* Piece Grid */}
        {typedPieces.length > 0 && (
          <div className="mt-4 grid grid-cols-7 gap-2">
            {typedPieces.map((piece) => (
              <div
                key={piece.id}
                className="flex flex-col items-center rounded-lg border border-sage/10 bg-cream p-2"
              >
                <span className="text-xs font-bold text-black">
                  Day {piece.day_number}
                </span>
                <span className="mt-0.5 text-[10px] capitalize text-gray-500">
                  {piece.content_type}
                </span>
                <PieceStatusDot status={piece.status} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-gray-300" /> Pending
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-yellow-400" /> Processing
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" /> Complete
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Failed
          </span>
        </div>
      </section>

      {typedPkg?.status === "processing" && (
        <p className="mt-6 text-center text-sm text-gray-500">
          Estimated processing time: 15–30 minutes. This page will update automatically.
        </p>
      )}

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

function PieceStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-gray-300",
    processing: "bg-yellow-400",
    complete: "bg-green-500",
    failed: "bg-red-500",
  };

  return (
    <span className={`mt-1 h-2 w-2 rounded-full ${colors[status] ?? colors.pending}`} />
  );
}
