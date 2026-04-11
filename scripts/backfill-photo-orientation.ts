/**
 * One-off dev script: backfill width, height, and orientation
 * for existing listing_photos rows using sharp.
 *
 * Usage: npm run backfill:photos
 *
 * Standalone — calls Supabase directly with the service role client.
 * Does NOT go through the /api/photos/process route.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

function computeOrientation(
  width: number,
  height: number
): "horizontal" | "vertical" | "square" {
  const ratio = width / height;
  if (ratio > 1.1) return "horizontal";
  if (ratio < 0.9) return "vertical";
  return "square";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Fetch photos missing dimensions or orientation
  const { data: photos, error } = await supabase
    .from("listing_photos")
    .select("id, file_path, listing_id")
    .or("width.is.null,height.is.null")
    .order("uploaded_at", { ascending: true });

  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }

  if (!photos || photos.length === 0) {
    console.log("No photos to process — all rows already have dimensions.");
    process.exit(0);
  }

  console.log(`Found ${photos.length} photos to process\n`);

  const counts = { horizontal: 0, vertical: 0, square: 0 };
  const failures: Record<string, number> = {};
  let processed = 0;

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    console.log(`[${i + 1}/${photos.length}] Processing ${photo.id}...`);

    try {
      // Download from storage
      const { data: fileData, error: dlErr } = await supabase.storage
        .from("listing-photos")
        .download(photo.file_path);

      if (dlErr || !fileData) {
        const reason = "download_failed";
        console.log(`  \u2717 Failed: ${reason} — ${dlErr?.message ?? "no data"}`);
        failures[reason] = (failures[reason] || 0) + 1;
        await sleep(100);
        continue;
      }

      // Extract dimensions
      const buffer = Buffer.from(await fileData.arrayBuffer());
      const metadata = await sharp(buffer).metadata();

      if (!metadata.width || !metadata.height) {
        const reason = "no_dimensions";
        console.log(`  \u2717 Failed: ${reason}`);
        failures[reason] = (failures[reason] || 0) + 1;
        await sleep(100);
        continue;
      }

      const { width, height } = metadata;
      const orientation = computeOrientation(width, height);

      // Update row
      const { error: updateErr } = await supabase
        .from("listing_photos")
        .update({ width, height, orientation })
        .eq("id", photo.id);

      if (updateErr) {
        const reason = "update_failed";
        console.log(`  \u2717 Failed: ${reason} — ${updateErr.message}`);
        failures[reason] = (failures[reason] || 0) + 1;
        await sleep(100);
        continue;
      }

      console.log(`  \u2713 ${orientation} (${width}x${height})`);
      counts[orientation]++;
      processed++;
    } catch (err) {
      const reason = "unexpected_error";
      console.log(`  \u2717 Failed: ${reason} — ${err instanceof Error ? err.message : String(err)}`);
      failures[reason] = (failures[reason] || 0) + 1;
    }

    await sleep(100);
  }

  console.log("\n=== BACKFILL COMPLETE ===");
  console.log(`  Total processed: ${processed} / ${photos.length}`);
  console.log(`  Horizontal: ${counts.horizontal}`);
  console.log(`  Vertical:   ${counts.vertical}`);
  console.log(`  Square:     ${counts.square}`);

  if (Object.keys(failures).length > 0) {
    console.log("  Failures:");
    for (const [reason, count] of Object.entries(failures)) {
      console.log(`    ${reason}: ${count}`);
    }
  }

  console.log("========================");
}

main();
