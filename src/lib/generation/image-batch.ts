import { createServiceClient } from "@/lib/supabase/server";
import { generatePostImages } from "./images-post";
import { generateStoryImages } from "./images-story";
import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import type { ContentPiece } from "@/types/content";

export async function runImageGeneration(
  listingId: string,
  packageId: string
): Promise<{ succeeded: number; failed: number }> {
  const supabase = createServiceClient();

  // Load listing + brand profile
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    throw new Error(`Failed to load listing: ${listingError?.message}`);
  }

  const { data: brand, error: brandError } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("id", (listing as Listing).brand_profile_id)
    .single();

  if (brandError || !brand) {
    throw new Error(`Failed to load brand profile: ${brandError?.message}`);
  }

  // Load content pieces (only posts and stories need images)
  const { data: pieces, error: piecesError } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("package_id", packageId)
    .order("day_number");

  if (piecesError || !pieces) {
    throw new Error(`Failed to load content pieces: ${piecesError?.message}`);
  }

  const typedListing = listing as Listing;
  const typedBrand = brand as BrandProfile;
  const typedPieces = pieces as ContentPiece[];

  const postPieces = typedPieces.filter((p) => p.content_type === "post");
  const storyPieces = typedPieces.filter((p) => p.content_type === "story");

  // Generate post and story images in parallel
  const [postResult, storyResult] = await Promise.allSettled([
    generatePostImages(typedListing, typedBrand, postPieces, listingId),
    generateStoryImages(typedListing, typedBrand, storyPieces, listingId),
  ]);

  let succeeded = 0;
  let failed = 0;

  if (postResult.status === "fulfilled") {
    succeeded += postResult.value.results.length;
    failed += postResult.value.errors.length;
  } else {
    console.error("Post image generation batch failed:", postResult.reason);
    failed += postPieces.length;
  }

  if (storyResult.status === "fulfilled") {
    succeeded += storyResult.value.results.length;
    failed += storyResult.value.errors.length;
  } else {
    console.error("Story image generation batch failed:", storyResult.reason);
    failed += storyPieces.length;
  }

  console.log(
    `Image generation complete for listing ${listingId}: ${succeeded} succeeded, ${failed} failed`
  );

  return { succeeded, failed };
}
