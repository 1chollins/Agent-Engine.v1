"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListingDetailsForm } from "@/components/listing/listing-details-form";
import { PhotoUpload } from "@/components/listing/photo-upload";
import type { Listing, ListingPhoto } from "@/types/listing";

type NewListingWizardProps = {
  userId: string;
  existingListing?: Listing | null;
  existingPhotos?: ListingPhoto[];
};

export function NewListingWizard({
  userId,
  existingListing,
  existingPhotos = [],
}: NewListingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "photos">(
    existingListing ? "photos" : "details"
  );
  const [listingId, setListingId] = useState<string | null>(
    existingListing?.id ?? null
  );

  function handleDetailsSaved(id: string) {
    setListingId(id);
    setStep("photos");
  }

  function handleProceedToReview() {
    if (listingId) {
      router.push(`/listings/${listingId}/review`);
    }
  }

  return (
    <div>
      {/* Step Indicator */}
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setStep("details")}
          className={`text-sm font-medium ${
            step === "details" ? "text-black underline underline-offset-4" : "text-gray-400"
          }`}
        >
          1. Property Details
        </button>
        <span className="text-gray-300">/</span>
        <button
          type="button"
          onClick={() => listingId && setStep("photos")}
          disabled={!listingId}
          className={`text-sm font-medium ${
            step === "photos" ? "text-black underline underline-offset-4" : "text-gray-400"
          } disabled:cursor-not-allowed`}
        >
          2. Photos
        </button>
      </div>

      {/* Step Content */}
      {step === "details" && (
        <div className="rounded-2xl border border-sage/20 bg-white p-8">
          <ListingDetailsForm
            mode={existingListing ? "edit" : "create"}
            initialData={existingListing}
            onSaved={handleDetailsSaved}
          />
        </div>
      )}

      {step === "photos" && listingId && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-sage/20 bg-white p-8">
            <h2 className="mb-4 text-lg font-semibold text-black">Upload Photos</h2>
            <PhotoUpload
              listingId={listingId}
              userId={userId}
              initialPhotos={existingPhotos}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep("details")}
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              Back to Details
            </button>
            <button
              type="button"
              onClick={handleProceedToReview}
              className="rounded-lg bg-sage px-6 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
            >
              Review & Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
