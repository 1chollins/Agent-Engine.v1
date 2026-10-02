"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { createListing, updateListing } from "@/lib/actions/listing";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { PROPERTY_TYPES, getPropertyClass } from "@/types/listing";
import type { Listing, PropertyType } from "@/types/listing";
import type { AgentOption } from "@/types/brand-profile";
import Link from "next/link";

type ListingDetailsFormProps = {
  mode: "create" | "edit";
  initialData?: Listing | null;
  onSaved?: (listingId: string) => void;
  /** Profiles this campaign can wear. The picker shows once there are client agents. */
  agents?: AgentOption[];
};

export function ListingDetailsForm({ mode, initialData, onSaved, agents = [] }: ListingDetailsFormProps) {
  const defaultAgentId =
    initialData?.brand_profile_id ?? agents.find((a) => a.is_primary)?.id ?? agents[0]?.id ?? "";
  const action = mode === "create" ? createListing : updateListing;
  const [state, formAction] = useFormState(action, {
    error: null,
    success: null,
  });
  const [propertyType, setPropertyType] = useState(
    initialData?.property_type ?? "single_family"
  );
  // Realtor or Airbnb host, from the profile this campaign is for.
  const [profileId, setProfileId] = useState(defaultAgentId);
  const isHost =
    (agents.find((a) => a.id === profileId) ?? agents.find((a) => a.is_primary))?.profile_type === "host";

  // Bed and bath counts describe a home, not an office or a retail unit, so
  // the fields are hidden for anything that isn't lived in.
  const propertyClass = getPropertyClass(propertyType as PropertyType);
  const showBedsBaths =
    propertyClass === "residential" || propertyClass === "multifamily";

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

      {/* Agent — whose branding this campaign carries */}
      {agents.length > 1 && (
        <section className="space-y-2 rounded-xl border border-forest/20 bg-cream/40 p-4">
          <label htmlFor="brand_profile_id" className="block text-sm font-semibold text-black">
            Client *
          </label>
          <select
            id="brand_profile_id"
            name="brand_profile_id"
            required
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            className="block w-full rounded-lg border border-sage bg-white px-3 py-2.5 text-sm shadow-sm focus:border-sage-darker focus:outline-none focus:ring-1 focus:ring-sage-darker"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {[
                  a.is_primary ? `${a.agent_name} (you)` : a.agent_name,
                  a.profile_type === "host" ? "Airbnb host" : "Realtor",
                  a.is_primary ? null : a.brokerage_name,
                ]
                  .filter(Boolean)
                  .join(" — ")}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            {isHost
              ? "A host campaign is written for guests: nightly rate, amenities, book your stay."
              : "A realtor campaign sells the home: price, features, showings."}{" "}
            Their name, contact and any photo, logo and colors go on every piece.{" "}
            <Link href="/agents/new" className="font-medium text-forest underline underline-offset-2">
              Add a client
            </Link>
          </p>
        </section>
      )}

      {/* Address Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-black">Property address</h2>
        <p className="-mt-2 text-sm text-gray-500">
          Only the address is required. Everything else is optional, but the more you add, the
          more specific the captions get.
        </p>
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
              Property type
            </label>
            <select
              id="property_type"
              name="property_type"
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
            key={isHost ? "rate" : "price"}
            label={isHost ? "Nightly rate" : "Price"}
            name="price"
            type="number"
            placeholder={isHost ? "189" : "425000"}
            defaultValue={initialData?.price?.toString()}
          />
        </div>

        {/* Year built applies to any building, so it stays outside the
            beds/baths group rather than disappearing with it. */}
        <div className="grid gap-4 sm:grid-cols-3">
          {showBedsBaths && (
            <>
              <FormField
                label="Bedrooms"
                name="bedrooms"
                type="number"
                defaultValue={initialData?.bedrooms?.toString()}
              />
              <FormField
                label="Bathrooms"
                name="bathrooms"
                type="number"
                placeholder="2.5"
                defaultValue={initialData?.bathrooms?.toString()}
              />
            </>
          )}
          {isHost && (
            <FormField
              label="Sleeps (guests)"
              name="max_guests"
              type="number"
              placeholder="8"
              defaultValue={initialData?.max_guests?.toString()}
            />
          )}
          {!isHost && propertyClass !== "land" && (
            <FormField
              label="Year Built"
              name="year_built"
              type="number"
              placeholder="2020"
              defaultValue={initialData?.year_built?.toString()}
            />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Square footage"
            name="sqft"
            type="number"
            defaultValue={initialData?.sqft?.toString()}
          />
          {!isHost && (
            <FormField
              label="Lot size"
              name="lot_size"
              placeholder="0.25 acres"
              defaultValue={initialData?.lot_size ?? ""}
            />
          )}
        </div>
      </section>

      {/* Features & Description */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-black">Features & Description</h2>
        <div className="space-y-1.5">
          <label htmlFor="features" className="block text-sm font-medium text-gray-700">
            {isHost ? "Amenities & highlights" : "Key features"}
          </label>
          <textarea
            id="features"
            name="features"
            rows={3}
            placeholder={
              isHost
                ? "Heated pool, hot tub, 5 min to the beach, game room, fast Wi-Fi..."
                : "Pool, waterfront, renovated kitchen, impact windows..."
            }
            defaultValue={initialData?.features ?? ""}
            className="block w-full rounded-lg border border-sage bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-sage-darker focus:outline-none focus:ring-1 focus:ring-sage-darker"
          />
        </div>
        <FormField
          label="Neighborhood"
          name="neighborhood"
          placeholder="Community or neighborhood name"
          defaultValue={initialData?.neighborhood ?? ""}
        />
        {!isHost && (
          <FormField
            label="HOA information"
            name="hoa_info"
            placeholder="Monthly fee, amenities included..."
            defaultValue={initialData?.hoa_info ?? ""}
          />
        )}
        <div className="space-y-1.5">
          <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            id="additional_notes"
            name="additional_notes"
            rows={2}
            placeholder={
              isHost
                ? "What guests love, nearby spots, seasonal deals, minimum stay..."
                : "Extra selling points or notes for content generation..."
            }
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
