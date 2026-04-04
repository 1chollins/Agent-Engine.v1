import { config } from "dotenv";
config({ path: ".env.local" });

import RunwayML from "@runwayml/sdk";
import { writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY,
});

// Public Unsplash real estate photo — modern home exterior
const SAMPLE_PHOTO_URL =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1280&q=80";

const PROMPT_TEXT =
  "Slow cinematic dolly zoom into the front of the house, gentle camera movement, golden hour lighting";

async function main() {
  console.log("=== SPIKE 2: Runway Image-to-Video ===\n");
  console.log(`Model:    gen3a_turbo`);
  console.log(`Duration: 5 seconds`);
  console.log(`Ratio:    768:1280 (vertical/portrait)`);
  console.log(`Photo:    Unsplash real estate exterior`);
  console.log(`Prompt:   ${PROMPT_TEXT}\n`);

  const start = performance.now();

  console.log("Creating image-to-video task...");

  const task = await client.imageToVideo.create({
    model: "gen3a_turbo",
    promptImage: SAMPLE_PHOTO_URL,
    promptText: PROMPT_TEXT,
    duration: 5,
    ratio: "768:1280",
  });

  console.log(`Task created: ${task.id}`);
  console.log("Polling for completion (this takes 30–120s)...\n");

  let result;
  let pollCount = 0;

  while (true) {
    await new Promise((r) => setTimeout(r, 6000));
    pollCount++;

    const status = await client.tasks.retrieve(task.id);
    const elapsed = Math.round((performance.now() - start) / 1000);

    if (status.status === "RUNNING") {
      const pct = status.progress
        ? `${Math.round(status.progress * 100)}%`
        : "...";
      console.log(`  [${elapsed}s] Running — ${pct} complete`);
    } else if (status.status === "PENDING" || status.status === "THROTTLED") {
      console.log(`  [${elapsed}s] ${status.status}`);
    } else if (status.status === "SUCCEEDED") {
      console.log(`  [${elapsed}s] Succeeded!\n`);
      result = status;
      break;
    } else if (status.status === "FAILED") {
      console.error(`\nGeneration failed: ${status.failure}`);
      if (status.failureCode) console.error(`Failure code: ${status.failureCode}`);
      process.exit(1);
    } else if (status.status === "CANCELLED") {
      console.error("\nTask was cancelled.");
      process.exit(1);
    }

    if (elapsed > 300) {
      console.error("\nTimeout: generation took over 5 minutes.");
      process.exit(1);
    }
  }

  const totalTime = Math.round((performance.now() - start) / 1000);

  if (!result.output || result.output.length === 0) {
    console.error("No output URL returned.");
    process.exit(1);
  }

  const videoUrl = result.output[0];
  console.log(`Video URL: ${videoUrl}\n`);

  // Download the video
  console.log("Downloading video...");
  const response = await fetch(videoUrl);

  if (!response.ok) {
    console.error(`Download failed: ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outputPath = join(__dirname, "output", "spike2-reel.mp4");
  await writeFile(outputPath, buffer);

  const fileSizeMB = (buffer.length / (1024 * 1024)).toFixed(2);

  // Gen-3 Alpha Turbo pricing: ~$0.50 per 5s generation
  const estimatedCost = 0.5;

  console.log("\n=== RESULTS ===\n");
  console.log(`Generation time: ${totalTime}s`);
  console.log(`Poll requests:   ${pollCount}`);
  console.log(`File size:       ${fileSizeMB} MB`);
  console.log(`Output file:     ${outputPath}`);
  console.log(`Est. cost:       ~$${estimatedCost.toFixed(2)}`);
  console.log(`\nSpike 2 PASSED — video generated successfully.`);
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
