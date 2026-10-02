"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  MIN_PHOTOS,
  MAX_PHOTOS,
  MIN_VERTICAL_PHOTOS,
  PROPERTY_TYPES,
  getPropertyClass,
} from "@/types/listing";
import type { ListingFormState, PropertyType } from "@/types/listing";

// Derived, not hand-written. This list was previously a copy of the property
// types and silently went stale when new ones were added — the form offered
// them and the server then rejected them as invalid.
const VALID_PROPERTY_TYPES: string[] = PROPERTY_TYPES.map((t) => t.value);

/** Bed and bath counts only describe a home. An office has neither. */
function hasBedsAndBaths(propertyType: string): boolean {
  const cls = getPropertyClass(propertyType as PropertyType);
  return cls === "residential" || cls === "multifamily";
}

export async function createListing(
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in", success: null };

  const fields = extractListingFields(formData);
  const validationError = validateListingFields(fields);
  if (validationError) return { error: validationError, success: null };

  const pickedProfileId = (formData.get("brand_profile_id") as string) || null;
  const profile = await resolveBrandProfile(supabase, user.id, pickedProfileId);

  if (!profile) {
    return {
      error: pickedProfileId ? "Pick a client from your Clients list" : "Complete your brand profile first",
      success: null,
    };
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      user_id: user.id,
      brand_profile_id: profile.id,
      ...fields,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return { error: error.message, success: null };

  return { error: null, success: "Listing saved", listingId: data.id };
}

export async function updateListing(
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in", success: null };

  const listingId = formData.get("listing_id") as string;
  const fields = extractListingFields(formData);
  const validationError = validateListingFields(fields);
  if (validationError) return { error: validationError, success: null };

  // Changing the agent is allowed while editing; it must be one this account owns.
  const pickedProfileId = (formData.get("brand_profile_id") as string) || null;
  let brandUpdate: { brand_profile_id?: string } = {};
  if (pickedProfileId) {
    const profile = await resolveBrandProfile(supabase, user.id, pickedProfileId);
    if (!profile) return { error: "Pick a client from your Clients list", success: null };
    brandUpdate = { brand_profile_id: profile.id };
  }

  const { error } = await supabase
    .from("listings")
    .update({ ...fields, ...brandUpdate, updated_at: new Date().toISOString() })
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) return { error: error.message, success: null };

  return { error: null, success: "Listing updated", listingId };
}

export async function submitListingForReview(listingId: string): Promise<ListingFormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in", success: null };

  const { data: photos } = await supabase
    .from("listing_photos")
    .select("id, orientation")
    .eq("listing_id", listingId);

  const count = photos?.length ?? 0;
  if (count < MIN_PHOTOS) return { error: `Upload at least ${MIN_PHOTOS} photos (${count} uploaded)`, success: null };
  if (count > MAX_PHOTOS) return { error: `Maximum ${MAX_PHOTOS} photos allowed`, success: null };

  const verticalCount = photos?.filter((p) => p.orientation === "vertical").length ?? 0;
  if (verticalCount > 0 && verticalCount < MIN_VERTICAL_PHOTOS) {
    return { error: `Upload at least ${MIN_VERTICAL_PHOTOS} vertical photos or remove them all (${verticalCount} uploaded)`, success: null };
  }

  const { error } = await supabase
    .from("listings")
    .update({ status: "pending_payment", updated_at: new Date().toISOString() })
    .eq("id", listingId)
    .eq("user_id", user.id)
    .eq("status", "draft");

  if (error) return { error: error.message, success: null };

  redirect(`/listings/${listingId}/review`);
}

export async function savePhotoRecord(
  listingId: string,
  filePath: string,
  fileName: string,
  fileSize: number,
  mimeType: string,
  sortOrder: number
): Promise<{ error: string | null; photoId?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("listing_photos")
    .insert({
      listing_id: listingId,
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
      sort_order: sortOrder,
      is_hero: sortOrder === 0,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, photoId: data.id };
}

export async function deletePhotoRecord(photoId: string): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { data: photo } = await supabase
    .from("listing_photos")
    .select("file_path, listing_id")
    .eq("id", photoId)
    .single();

  if (!photo) return { error: "Photo not found" };

  await supabase.storage.from("listing-photos").remove([photo.file_path]);

  const { error } = await supabase
    .from("listing_photos")
    .delete()
    .eq("id", photoId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function updatePhotoOrder(
  photos: { id: string; sort_order: number; is_hero: boolean }[]
): Promise<{ error: string | null }> {
  const supabase = createClient();

  for (const photo of photos) {
    const { error } = await supabase
      .from("listing_photos")
      .update({ sort_order: photo.sort_order, is_hero: photo.is_hero })
      .eq("id", photo.id);

    if (error) return { error: error.message };
  }

  return { error: null };
}

export async function setHeroPhoto(
  listingId: string,
  photoId: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  // Clear all heroes for this listing
  await supabase
    .from("listing_photos")
    .update({ is_hero: false })
    .eq("listing_id", listingId);

  // Set new hero
  const { error } = await supabase
    .from("listing_photos")
    .update({ is_hero: true })
    .eq("id", photoId);

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * The profile a listing will wear: the picked client agent (only if this
 * account owns it), otherwise the account's own primary profile.
 */
async function resolveBrandProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  pickedProfileId: string | null
): Promise<{ id: string } | null> {
  const query = supabase.from("brand_profiles").select("id").eq("user_id", userId);
  const { data } = pickedProfileId
    ? await query.eq("id", pickedProfileId).maybeSingle()
    : await query.eq("is_primary", true).maybeSingle();
  return (data as { id: string } | null) ?? null;
}

/** A positive number, or null when blank (everything but the address is optional). */
function optionalNumber(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").replace(/[$,\s]/g, "");
  const n = Number(raw);
  return raw && Number.isFinite(n) && n > 0 ? n : null;
}

function optionalText(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value : null;
}

function extractListingFields(formData: FormData) {
  const propertyType = optionalText(formData, "property_type");
  const wantsBedsBaths = !propertyType || hasBedsAndBaths(propertyType);
  const integer = (key: string) => {
    const n = optionalNumber(formData, key);
    return n == null ? null : Math.round(n);
  };

  return {
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    zip_code: String(formData.get("zip_code") ?? "").trim(),
    property_type: propertyType,
    bedrooms: wantsBedsBaths ? integer("bedrooms") : null,
    bathrooms: wantsBedsBaths ? optionalNumber(formData, "bathrooms") : null,
    sqft: integer("sqft"),
    lot_size: optionalText(formData, "lot_size"),
    // Sale price for realtors, nightly rate for hosts.
    price: integer("price"),
    max_guests: integer("max_guests"),
    year_built: integer("year_built"),
    features: optionalText(formData, "features"),
    neighborhood: optionalText(formData, "neighborhood"),
    hoa_info: optionalText(formData, "hoa_info"),
    additional_notes: optionalText(formData, "additional_notes"),
  };
}

/** Only the address is required (2026-10). */
function validateListingFields(fields: ReturnType<typeof extractListingFields>): string | null {
  if (!fields.address) return "Street address is required";
  if (!fields.city) return "City is required";
  if (!fields.state) return "State is required";
  if (!fields.zip_code) return "ZIP code is required";
  if (fields.property_type && !VALID_PROPERTY_TYPES.includes(fields.property_type)) return "Invalid property type";
  return null;
}
