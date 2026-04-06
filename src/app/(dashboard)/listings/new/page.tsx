import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { checkBrandProfileComplete } from "@/lib/brand-profile-check";
import { NewListingWizard } from "@/components/listing/new-listing-wizard";
import type { Listing, ListingPhoto } from "@/types/listing";

type NewListingPageProps = {
  searchParams: { draft?: string; step?: string };
};

export default async function NewListingPage({ searchParams }: NewListingPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const result = await checkBrandProfileComplete(user.id);

  if (!result.complete) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold text-black">
          Complete Your Brand Profile First
        </h1>
        <p className="mt-3 text-gray-600">
          You need to complete your brand profile before submitting a listing.
          The following fields are missing:
        </p>
        <ul className="mt-4 space-y-1 text-sm text-red-600">
          {result.missingFields.map((field) => (
            <li key={field}>
              {field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </li>
          ))}
        </ul>
        <Link
          href="/settings/brand"
          className="mt-6 inline-block rounded-lg bg-sage px-6 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
        >
          Complete Brand Profile
        </Link>
      </div>
    );
  }

  // Load existing draft if editing
  let existingListing: Listing | null = null;
  let existingPhotos: ListingPhoto[] = [];

  if (searchParams.draft) {
    const { data: listing } = await supabase
      .from("listings")
      .select("*")
      .eq("id", searchParams.draft)
      .eq("user_id", user.id)
      .single();

    if (listing) {
      existingListing = listing as Listing;

      const { data: photos } = await supabase
        .from("listing_photos")
        .select("*")
        .eq("listing_id", searchParams.draft)
        .order("sort_order");

      existingPhotos = (photos ?? []) as ListingPhoto[];
    }
  }

  const isEditing = !!existingListing;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-black sm:text-3xl">
        {isEditing ? "Edit Listing" : "New Listing"}
      </h1>
      <p className="mb-8 text-gray-600">
        {isEditing
          ? "Update your property details and photos."
          : "Enter your property details and upload photos to generate your content package."}
      </p>
      <NewListingWizard
        userId={user.id}
        existingListing={existingListing}
        existingPhotos={existingPhotos}
        initialStep={searchParams.step === "details" ? "details" : undefined}
      />
    </div>
  );
}
