/**
 * Dev utility: print signed URLs for a random sample of listing_photos
 * with a given content_tag, for eyeballing classification quality.
 *
 * Usage: tsx scripts/sample-photos-by-tag.ts <content_tag> [count]
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const tag = process.argv[2];
  if (!tag) {
    console.error(
      "Usage: tsx scripts/sample-photos-by-tag.ts <content_tag> [count]"
    );
    process.exit(1);
  }

  const countArg = process.argv[3];
  const parsedCount = countArg ? parseInt(countArg, 10) : NaN;
  const count = Number.isFinite(parsedCount) && parsedCount > 0 ? parsedCount : 10;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: photos, error } = await supabase
    .from("listing_photos")
    .select("id, file_path, listing_id")
    .eq("content_tag", tag);

  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }

  if (!photos || photos.length === 0) {
    console.log(`No photos found with content_tag=${tag}`);
    process.exit(0);
  }

  // Fisher-Yates shuffle
  const shuffled = [...photos];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const sample = shuffled.slice(0, count);

  console.log(`Sampling ${sample.length} of ${photos.length} photos tagged '${tag}'\n`);

  const results: { index: number; photoId: string; url: string }[] = [];

  for (let i = 0; i < sample.length; i++) {
    const photo = sample[i];
    const { data: signed, error: signErr } = await supabase.storage
      .from("listing-photos")
      .createSignedUrl(photo.file_path, 86400);

    if (signErr || !signed) {
      console.log(`[${i + 1}] ${photo.id}`);
      console.log(`    \u2717 sign_failed: ${signErr?.message ?? "no url"}`);
      continue;
    }

    console.log(`[${i + 1}] ${photo.id}`);
    console.log(`    ${signed.signedUrl}`);
    results.push({ index: i + 1, photoId: photo.id, url: signed.signedUrl });
  }

  const cards = results
    .map(
      (r) => `    <div class="card">
      <img src="${r.url}">
      <div class="cap">[${r.index}] ${r.photoId} — ${tag}</div>
    </div>`
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Sample: ${tag}</title>
<style>
body { background:#1a1a1a; color:#eee; font-family:sans-serif; margin:0; padding:16px; }
h2 { font-weight:normal; }
.grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.card { background:#262626; border-radius:6px; overflow:hidden; }
.card img { width:100%; height:260px; object-fit:cover; display:block; }
.cap { font-size:12px; padding:8px 10px; color:#bbb; word-break:break-all; }
</style>
</head>
<body>
<h2>Sampling ${results.length} photos tagged '${tag}'</h2>
<div class="grid">
${cards}
</div>
</body>
</html>
`;

  const tmpDir = path.join(process.cwd(), "tmp");
  fs.mkdirSync(tmpDir, { recursive: true });
  const outPath = path.join(tmpDir, `sample-${tag}.html`);
  fs.writeFileSync(outPath, html);

  console.log(`\nWrote tmp/sample-${tag}.html — open it in your browser.`);
}

main();
