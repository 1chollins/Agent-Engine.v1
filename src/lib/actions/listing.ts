"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MIN_PHOTOS, MAX_PHOTOS, MIN_VERTICAL_PHOTOS } from "@/types/listing";
import type { ListingFormState } from "@/types/listing";

const VALID_PROPERTY_TYPES = [
  "single_family", "condo", "townhome", "villa", "multi_family", "vacant_land",
];

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

  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Complete your brand profile first", success: null };

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

  const { error } = await supabase
    .from("listings")
    .update({ ...fields, updated_at: new Date().toISOString() })
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

function extractListingFields(formData: FormData) {
  const propertyType = formData.get("property_type") as string;
  const isVacantLand = propertyType === "vacant_land";

  return {
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    zip_code: formData.get("zip_code") as string,
    property_type: propertyType,
    bedrooms: isVacantLand ? null : Number(formData.get("bedrooms")) || null,
    bathrooms: isVacantLand ? null : Number(formData.get("bathrooms")) || null,
    sqft: Number(formData.get("sqft")) || 0,
    lot_size: (formData.get("lot_size") as string) || null,
    price: Number(formData.get("price")) || 0,
    year_built: Number(formData.get("year_built")) || null,
    features: formData.get("features") as string,
    neighborhood: (formData.get("neighborhood") as string) || null,
    hoa_info: (formData.get("hoa_info") as string) || null,
    additional_notes: (formData.get("additional_notes") as string) || null,
  };
}

function validateListingFields(fields: ReturnType<typeof extractListingFields>): string | null {
  if (!fields.address) return "Address is required";
  if (!fields.city) return "City is required";
  if (!fields.state) return "State is required";
  if (!fields.zip_code) return "ZIP code is required";
  if (!VALID_PROPERTY_TYPES.includes(fields.property_type)) return "Invalid property type";
  if (!fields.sqft || fields.sqft <= 0) return "Square footage is required";
  if (!fields.price || fields.price <= 0) return "Price is required";
  if (!fields.features) return "Key features are required";
  return null;
}
