/**
 * One-off cleanup script: delete a test artifact from listing_photos + storage.
 * Usage: npm run cleanup:test-artifact
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";

const TARGET_ID = "4eb007f4-023b-4943-b953-b17988e8dc67";

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Fetch the row
  const { data: photo, error: fetchErr } = await supabase
    .from("listing_photos")
    .select("*")
    .eq("id", TARGET_ID)
    .single();

  if (fetchErr || !photo) {
    console.error(`Row not found: ${fetchErr?.message ?? "no data"}`);
    process.exit(1);
  }

  console.log("Found test artifact:");
  console.log(`  id:          ${photo.id}`);
  console.log(`  listing_id:  ${photo.listing_id}`);
  console.log(`  file_name:   ${photo.file_name}`);
  console.log(`  file_path:   ${photo.file_path}`);
  console.log(`  file_size:   ${photo.file_size}`);
  console.log(`  mime_type:   ${photo.mime_type}`);
  console.log(`  width:       ${photo.width}`);
  console.log(`  height:      ${photo.height}`);
  console.log(`  orientation: ${photo.orientation}`);
  console.log(`  uploaded_at: ${photo.uploaded_at}`);
  console.log();

  const answer = await ask("Delete this row and its storage file? [y/N] ");

  if (answer.toLowerCase() !== "y") {
    console.log("Aborted");
    process.exit(0);
  }

  // Delete from storage first
  const { error: storageErr } = await supabase.storage
    .from("listing-photos")
    .remove([photo.file_path]);

  if (storageErr) {
    console.error(`Storage delete FAILED: ${storageErr.message}`);
    console.error("Database row NOT deleted (storage must succeed first)");
    process.exit(1);
  }

  console.log("Storage file deleted");

  // Then delete the database row
  const { error: dbErr } = await supabase
    .from("listing_photos")
    .delete()
    .eq("id", TARGET_ID);

  if (dbErr) {
    console.error(`Database delete FAILED: ${dbErr.message}`);
    console.error("WARNING: Storage file was already deleted but DB row remains");
    process.exit(1);
  }

  console.log("Database row deleted");
  console.log("Cleanup complete");
}

main();
