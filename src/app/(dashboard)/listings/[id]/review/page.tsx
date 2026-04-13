import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingPhoto } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import { PROPERTY_TYPES, MIN_PHOTOS } from "@/types/listing";
import { CheckoutButton } from "@/components/listing/checkout-button";

type ReviewPageProps = {
  params: { id: string };
};

export default async function ListingReviewPage({ params }: ReviewPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!listing) redirect("/listings");

  const { data: photos } = await supabase
    .from("listing_photos")
    .select("*")
    .eq("listing_id", params.id)
    .order("sort_order");

  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const typedListing = listing as Listing;
  const typedPhotos = (photos ?? []) as ListingPhoto[];
  const typedProfile = profile as BrandProfile | null;
  const photoCount = typedPhotos.length;
  const canSubmit = photoCount >= MIN_PHOTOS;
  const propertyLabel = PROPERTY_TYPES.find(
    (t) => t.value === typedListing.property_type
  )?.label;

  // Generate signed URLs for all photos (private bucket)
  const photosWithUrls = await Promise.all(
    typedPhotos.map(async (photo) => {
      const { data } = await supabase.storage
        .from("listing-photos")
        .createSignedUrl(photo.file_path, 3600);
      return { ...photo, signedUrl: data?.signedUrl ?? null };
    })
  );

  const heroWithUrl = photosWithUrls.find((p) => p.is_hero) ?? photosWithUrls[0];
  const verticalHeroWithUrl = typedListing.vertical_hero_photo_id
    ? photosWithUrls.find((p) => p.id === typedListing.vertical_hero_photo_id)
    : photosWithUrls.find((p) => p.orientation === "vertical");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-black sm:text-3xl">Review Listing</h1>
      <p className="mb-8 text-gray-600">
        Review your listing details before proceeding to payment.
      </p>

      {/* Property Details */}
      <section className="rounded-2xl border border-sage/20 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Property Details</h2>
          <Link
            href={`/listings/new?draft=${params.id}&step=details`}
            className="text-sm font-medium text-sage-darker hover:text-black"
          >
            Edit Details
          </Link>
        </div>

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <DetailRow label="Address" value={typedListing.address} />
          <DetailRow
            label="Location"
            value={`${typedListing.city}, ${typedListing.state} ${typedListing.zip_code}`}
          />
          <DetailRow label="Type" value={propertyLabel ?? typedListing.property_type} />
          <DetailRow
            label="Price"
            value={`$${typedListing.price.toLocaleString()}`}
          />
          {typedListing.bedrooms != null && (
            <DetailRow label="Bedrooms" value={String(typedListing.bedrooms)} />
          )}
          {typedListing.bathrooms != null && (
            <DetailRow label="Bathrooms" value={String(typedListing.bathrooms)} />
          )}
          <DetailRow label="Sq Ft" value={typedListing.sqft.toLocaleString()} />
          {typedListing.lot_size && (
            <DetailRow label="Lot Size" value={typedListing.lot_size} />
          )}
          {typedListing.year_built && (
            <DetailRow label="Year Built" value={String(typedListing.year_built)} />
          )}
        </dl>

        <div className="mt-4 border-t border-sage/10 pt-4">
          <p className="text-sm font-medium text-gray-700">Key Features</p>
          <p className="mt-1 text-sm text-gray-600">{typedListing.features}</p>
        </div>

        {typedListing.neighborhood && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700">Neighborhood</p>
            <p className="mt-1 text-sm text-gray-600">{typedListing.neighborhood}</p>
          </div>
        )}
      </section>

      {/* Photos */}
      <section className="mt-6 rounded-2xl border border-sage/20 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">
            Photos ({photoCount})
          </h2>
          <Link
            href={`/listings/new?draft=${params.id}&step=photos`}
            className="text-sm font-medium text-sage-darker hover:text-black"
          >
            Edit Photos
          </Link>
        </div>

        {!canSubmit && (
          <p className="mt-2 text-sm text-red-600">
            Upload at least {MIN_PHOTOS} photos to proceed ({photoCount} uploaded).
          </p>
        )}

        {/* Hero photo */}
        {heroWithUrl?.signedUrl && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-gray-500">HERO PHOTO</p>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={heroWithUrl.signedUrl}
                alt="Hero photo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Vertical hero photo */}
        {verticalHeroWithUrl?.signedUrl && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-gray-500">VERTICAL HERO</p>
            <div className="relative aspect-[9/16] w-48 overflow-hidden rounded-lg">
              <Image
                src={verticalHeroWithUrl.signedUrl}
                alt="Vertical hero photo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Thumbnail grid */}
        {photosWithUrls.length > 1 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-gray-500">
              ALL PHOTOS ({photosWithUrls.length})
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
              {photosWithUrls.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative aspect-square overflow-hidden rounded-lg ${
                    photo.is_hero ? "ring-2 ring-sage-darker" : ""
                  }`}
                >
                  {photo.signedUrl ? (
                    <Image
                      src={photo.signedUrl}
                      alt={photo.file_name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                      No preview
                    </div>
                  )}
                  {photo.is_hero && (
                    <span className="absolute bottom-0.5 left-0.5 rounded bg-sage-darker px-1 py-0.5 text-[8px] font-bold text-white">
                      HERO
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Brand Profile Summary */}
      {typedProfile && (
        <section className="mt-6 rounded-2xl border border-sage/20 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-black">Brand Profile</h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className="h-6 w-6 rounded-full border"
                style={{ backgroundColor: typedProfile.primary_color }}
              />
              <div
                className="h-6 w-6 rounded-full border"
                style={{ backgroundColor: typedProfile.secondary_color }}
              />
              {typedProfile.accent_color && (
                <div
                  className="h-6 w-6 rounded-full border"
                  style={{ backgroundColor: typedProfile.accent_color }}
                />
              )}
            </div>
            <div className="text-sm text-gray-600">
              {typedProfile.agent_name} — {typedProfile.brokerage_name}
            </div>
          </div>
        </section>
      )}

      {/* Processing Info */}
      <section className="mt-6 rounded-2xl border border-sage/20 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-black">What Happens Next</h2>
        <p className="mt-2 text-sm text-gray-600">
          After payment, we generate your 14-piece content package: 5 branded posts,
          5 video reels, and 4 stories. Estimated processing time: 5–10 minutes.
        </p>
      </section>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <Link
          href={`/listings/new?draft=${params.id}&step=photos`}
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          Back to Editing
        </Link>
        <CheckoutButton listingId={params.id} disabled={!canSubmit} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-black">{value}</dd>
    </div>
  );
}
