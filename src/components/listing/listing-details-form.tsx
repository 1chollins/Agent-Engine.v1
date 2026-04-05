"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { createListing, updateListing } from "@/lib/actions/listing";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { PROPERTY_TYPES } from "@/types/listing";
import type { Listing, PropertyType } from "@/types/listing";

type ListingDetailsFormProps = {
  mode: "create" | "edit";
  initialData?: Listing | null;
  onSaved?: (listingId: string) => void;
};

export function ListingDetailsForm({ mode, initialData, onSaved }: ListingDetailsFormProps) {
  const action = mode === "create" ? createListing : updateListing;
  const [state, formAction] = useFormState(action, {
    error: null,
    success: null,
  });
  const [propertyType, setPropertyType] = useState(
    initialData?.property_type ?? "single_family"
  );

  const isVacantLand = propertyType === "vacant_land";

  // Notify parent when saved successfully
  if (state.success && state.listingId && onSaved) {
    onSaved(state.listingId);
  }

  return (
    <form action={formAction} className="space-y-6">
      {initialData?.id && (
        <input type="hidden" name="listing_id" value={initialData.id} />
      )}

      {state.error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {/* Address Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-black">Property Address</h2>
        <FormField
          label="Street Address *"
          name="address"
          required
          defaultValue={initialData?.address}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="City *"
            name="city"
            required
            defaultValue={initialData?.city}
          />
          <FormField
            label="State *"
            name="state"
            required
            defaultValue={initialData?.state}
          />
          <FormField
            label="ZIP Code *"
            name="zip_code"
            required
            defaultValue={initialData?.zip_code}
          />
        </div>
      </section>

      {/* Property Details */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-black">Property Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="property_type" className="block text-sm font-medium text-gray-700">
              Property Type *
            </label>
            <select
              id="property_type"
              name="property_type"
              required
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className="block w-full rounded-lg border border-sage bg-white px-3 py-2.5 text-sm shadow-sm focus:border-sage-darker focus:outline-none focus:ring-1 focus:ring-sage-darker"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <FormField
            label="Price *"
            name="price"
            type="number"
            required
            placeholder="425000"
            defaultValue={initialData?.price?.toString()}
          />
        </div>

        {!isVacantLand && (
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              label="Bedrooms *"
              name="bedrooms"
              type="number"
              required={!isVacantLand}
              defaultValue={initialData?.bedrooms?.toString()}
            />
            <FormField
              label="Bathrooms *"
              name="bathrooms"
              type="number"
              required={!isVacantLand}
              placeholder="2.5"
              defaultValue={initialData?.bathrooms?.toString()}
            />
            <FormField
              label="Year Built"
              name="year_built"
              type="number"
              placeholder="2020"
              defaultValue={initialData?.year_built?.toString()}
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Square Footage *"
            name="sqft"
            type="number"
            required
            defaultValue={initialData?.sqft?.toString()}
          />
          <FormField
            label="Lot Size"
            name="lot_size"
            placeholder="0.25 acres"
            defaultValue={initialData?.lot_size ?? ""}
          />
        </div>
      </section>

      {/* Features & Description */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-black">Features & Description</h2>
        <div className="space-y-1.5">
          <label htmlFor="features" className="block text-sm font-medium text-gray-700">
            Key Features *
          </label>
          <textarea
            id="features"
            name="features"
            required
            rows={3}
            placeholder="Pool, waterfront, renovated kitchen, impact windows..."
            defaultValue={initialData?.features}
            className="block w-full rounded-lg border border-sage bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-sage-darker focus:outline-none focus:ring-1 focus:ring-sage-darker"
          />
        </div>
        <FormField
          label="Neighborhood"
          name="neighborhood"
          placeholder="Community or neighborhood name"
          defaultValue={initialData?.neighborhood ?? ""}
        />
        <FormField
          label="HOA Information"
          name="hoa_info"
          placeholder="Monthly fee, amenities included..."
          defaultValue={initialData?.hoa_info ?? ""}
        />
        <div className="space-y-1.5">
          <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            id="additional_notes"
            name="additional_notes"
            rows={2}
            placeholder="Extra selling points or notes for content generation..."
            defaultValue={initialData?.additional_notes ?? ""}
            className="block w-full rounded-lg border border-sage bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-sage-darker focus:outline-none focus:ring-1 focus:ring-sage-darker"
          />
        </div>
      </section>

      <SubmitButton pendingText="Saving...">
        {mode === "create" ? "Save & Continue to Photos" : "Save Changes"}
      </SubmitButton>
    </form>
  );
}
