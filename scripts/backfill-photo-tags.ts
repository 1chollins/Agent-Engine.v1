/**
 * One-off dev script: backfill content_tag for existing listing_photos
 * rows using Claude Haiku vision.
 *
 * Usage: tsx scripts/backfill-photo-tags.ts
 *
 * Standalone — calls Supabase + Anthropic directly with the service role client.
 * Does NOT go through the /api/photos/tag route.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { classifyPhoto } from "../src/lib/generation/photo-tagging";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Missing ANTHROPIC_API_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Fetch photos missing a content_tag
  const { data: photos, error } = await supabase
    .from("listing_photos")
    .select("id, file_path, listing_id")
    .is("content_tag", null)
    .order("uploaded_at", { ascending: true });

  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }

  if (!photos || photos.length === 0) {
    console.log("No photos to process — all rows already have content_tag.");
    process.exit(0);
  }

  console.log(`Found ${photos.length} photos to process\n`);

  const counts: Record<string, number> = {};
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
        console.log(
          `  \u2717 Failed: ${reason} — ${dlErr?.message ?? "no data"}`
        );
        failures[reason] = (failures[reason] || 0) + 1;
        await sleep(100);
        continue;
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());

      // Classify via Haiku vision
      let tag: string;
      try {
        const result = await classifyPhoto({
          imageBuffer: buffer,
          supabase,
          listingId: photo.listing_id,
        });
        tag = result.tag;
      } catch (err) {
        const reason = "classify_failed";
        console.log(
          `  \u2717 Failed: ${reason} — ${err instanceof Error ? err.message : String(err)}`
        );
        failures[reason] = (failures[reason] || 0) + 1;
        await sleep(100);
        continue;
      }

      // Update row
      const { error: updateErr } = await supabase
        .from("listing_photos")
        .update({ content_tag: tag })
        .eq("id", photo.id);

      if (updateErr) {
        const reason = "update_failed";
        console.log(`  \u2717 Failed: ${reason} — ${updateErr.message}`);
        failures[reason] = (failures[reason] || 0) + 1;
        await sleep(100);
        continue;
      }

      console.log(`  \u2713 ${tag}`);
      counts[tag] = (counts[tag] || 0) + 1;
      processed++;
    } catch (err) {
      const reason = "unexpected_error";
      console.log(
        `  \u2717 Failed: ${reason} — ${err instanceof Error ? err.message : String(err)}`
      );
      failures[reason] = (failures[reason] || 0) + 1;
    }

    await sleep(100);
  }

  console.log("\n=== BACKFILL COMPLETE ===");
  console.log(`  Total processed: ${processed} / ${photos.length}`);
  for (const [tag, count] of Object.entries(counts).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`  ${tag.padEnd(18)} ${count}`);
  }

  if (Object.keys(failures).length > 0) {
    console.log("  Failures:");
    for (const [reason, count] of Object.entries(failures)) {
      console.log(`    ${reason}: ${count}`);
    }
  }

  console.log("========================");
}

main();
