/**
 * Standalone test script for Creatomate reel rendering.
 * Usage: npm run test:creatomate <listing_id>
 *
 * Self-contained — does not import from src/ (which uses Next.js path aliases).
 * Duplicates the buildJustListedModifications + renderReel logic for testing.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { Client as CreatomateClient } from "creatomate";

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

async function main() {
  const listingId = process.argv[2];
  if (!listingId) {
    console.error("Usage: npm run test:creatomate <listing_id>");
    process.exit(1);
  }

  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) {
    console.error("Missing CREATOMATE_API_KEY in .env.local");
    process.exit(1);
  }

  const templateId = process.env.CREATOMATE_TEMPLATE_DAY1_JUST_LISTED;
  if (!templateId) {
    console.error("Missing CREATOMATE_TEMPLATE_DAY1_JUST_LISTED in .env.local");
    process.exit(1);
  }

  console.log(`Using template: Just Listed — Property Stats (${templateId})`);

  // Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch listing
  const { data: listing, error: listingErr } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (listingErr || !listing) {
    console.error(`Listing not found: ${listingErr?.message ?? "no data"}`);
    process.exit(1);
  }

  console.log(`Listing: ${listing.address}, ${listing.city}, ${listing.state}`);

  // Fetch brand profile
  const { data: brand, error: brandErr } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("user_id", listing.user_id)
    .single();

  if (brandErr || !brand) {
    console.error(`Brand profile not found: ${brandErr?.message ?? "no data"}`);
    process.exit(1);
  }

  console.log(`Agent: ${brand.agent_name}, ${brand.brokerage_name}`);

  // Fetch first 5 photos
  const { data: photos, error: photoErr } = await supabase
    .from("listing_photos")
    .select("id, file_path")
    .eq("listing_id", listingId)
    .order("sort_order")
    .limit(5);

  if (photoErr || !photos || photos.length < 5) {
    console.error(
      `Need at least 5 photos, found ${photos?.length ?? 0}: ${photoErr?.message ?? ""}`
    );
    process.exit(1);
  }

  // Generate signed URLs (1 hour TTL)
  const photoUrls: string[] = [];
  for (const photo of photos) {
    const { data: signed } = await supabase.storage
      .from("listing-photos")
      .createSignedUrl(photo.file_path, 3600);
    if (!signed?.signedUrl) {
      console.error(`Failed to sign URL for photo ${photo.id}`);
      process.exit(1);
    }
    photoUrls.push(signed.signedUrl);
  }

  console.log(`Photos: ${photoUrls.length} signed URLs generated`);

  // Generate headshot signed URL
  let headshotUrl = "";
  if (brand.headshot_path) {
    const { data: signed } = await supabase.storage
      .from("brand-assets")
      .createSignedUrl(brand.headshot_path, 3600);
    headshotUrl = signed?.signedUrl ?? "";
  }

  if (!headshotUrl) {
    console.error("No headshot URL available for agent");
    process.exit(1);
  }

  // Build modifications
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(listing.price);

  const details1: string[] = [];
  if (listing.sqft) details1.push(`${Number(listing.sqft).toLocaleString()} sqft`);
  if (listing.bedrooms) details1.push(`${listing.bedrooms} Bedrooms`);
  if (listing.bathrooms) details1.push(`${listing.bathrooms} Bathrooms`);

  const details2: string[] = [];
  if (listing.year_built) details2.push(`Built in ${listing.year_built}`);
  if (listing.lot_size) details2.push(listing.lot_size);
  details2.push(price);

  const modifications: Record<string, string> = {
    "Text.text": "Just Listed",
    "Address.text": `${listing.address},\n${listing.city}, ${listing.state} ${listing.zip_code}`,
    "Details-1.text": details1.join("\n"),
    "Details-2.text": details2.join("\n"),
    "Photo-1.source": photoUrls[0],
    "Photo-2.source": photoUrls[1],
    "Photo-3.source": photoUrls[2],
    "Photo-4.source": photoUrls[3],
    "Photo-5.source": photoUrls[4],
    "Name.text": brand.agent_name,
    "Brand-Name.text": brand.brokerage_name,
    "Phone-Number.text": brand.phone,
    "Email.text": brand.email,
    "Picture.source": headshotUrl,
  };

  console.log("\nModifications:");
  for (const [key, value] of Object.entries(modifications)) {
    const display = value.length > 80 ? value.slice(0, 77) + "..." : value;
    console.log(`  ${key}: ${display}`);
  }

  console.log("\nStarting Creatomate render...");
  const startTime = Date.now();

  try {
    const client = new CreatomateClient(apiKey);
    console.log("Calling client.render()...");
    let renders;
    try {
      renders = await client.render({
        templateId,
        modifications,
      });
    } catch (renderErr: unknown) {
      console.error("client.render() threw:", renderErr);
      throw renderErr;
    }
    console.log("Render returned:", JSON.stringify(renders?.map(r => ({ id: r.id, status: r.status, error: r.errorMessage })), null, 2));

    const result = renders[0];
    if (!result) {
      throw new Error("Creatomate returned no render results");
    }

    if (result.status === "failed") {
      throw new Error(`Render failed: ${result.errorMessage ?? "Unknown error"}`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("\n=== RENDER COMPLETE ===");
    console.log(`  URL:          ${result.url}`);
    console.log(`  Duration:     ${result.duration ?? "unknown"}s`);
    console.log(`  Dimensions:   ${result.width ?? "?"}x${result.height ?? "?"}`);
    console.log(`  Snapshot:     ${result.snapshotUrl ?? "none"}`);
    console.log(`  Elapsed:      ${elapsed}s`);
    console.log("========================");
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`\nRender FAILED after ${elapsed}s:`);
    if (err instanceof Error) {
      console.error(err.message);
      if ("response" in err) console.error("Response:", JSON.stringify((err as any).response, null, 2));
      if ("body" in err) console.error("Body:", (err as any).body);
    } else {
      console.error(JSON.stringify(err, null, 2));
    }
    process.exit(1);
  }
}

main();
