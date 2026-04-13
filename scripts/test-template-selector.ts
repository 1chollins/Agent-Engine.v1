import { selectTemplate, getPhotoCountForTemplate } from "../src/lib/generation/template-selector";

const CONTENT_SCHEDULE: { day: number; type: "post" | "reel" | "story" }[] = [
  { day: 1, type: "post" },
  { day: 2, type: "reel" },
  { day: 3, type: "story" },
  { day: 4, type: "post" },
  { day: 5, type: "reel" },
  { day: 6, type: "story" },
  { day: 7, type: "post" },
  { day: 8, type: "reel" },
  { day: 9, type: "story" },
  { day: 10, type: "post" },
  { day: 11, type: "reel" },
  { day: 12, type: "story" },
  { day: 13, type: "post" },
  { day: 14, type: "reel" },
];

const RUNS = 20;

console.log("=== Template Selector Test ===\n");

// Single run with full output
console.log("--- Single run (all 14 days) ---");
for (const entry of CONTENT_SCHEDULE) {
  if (entry.type === "post") {
    console.log(`  Day ${entry.day.toString().padStart(2)}: post (no Creatomate template)`);
    continue;
  }
  const key = selectTemplate({ contentType: entry.type, dayNumber: entry.day });
  const photoCount = getPhotoCountForTemplate(key);
  console.log(`  Day ${entry.day.toString().padStart(2)}: ${entry.type.padEnd(5)} → ${key} (${photoCount} photos)`);
}

// Randomization test for stories
console.log(`\n--- Story randomization (${RUNS} runs) ---`);
const counts: Record<string, number> = {};

for (let run = 0; run < RUNS; run++) {
  for (const entry of CONTENT_SCHEDULE) {
    if (entry.type !== "story") continue;
    const key = selectTemplate({ contentType: "story", dayNumber: entry.day });
    counts[key] = (counts[key] ?? 0) + 1;
  }
}

const totalStorySelections = RUNS * 4; // 4 story days per run
for (const [key, count] of Object.entries(counts)) {
  const pct = ((count / totalStorySelections) * 100).toFixed(1);
  console.log(`  ${key}: ${count}/${totalStorySelections} (${pct}%)`);
}

// Validation: invalid combos should throw
console.log("\n--- Validation tests ---");
const invalidCombos: { type: "reel" | "story"; day: number }[] = [
  { type: "reel", day: 3 },
  { type: "story", day: 2 },
  { type: "reel", day: 7 },
  { type: "story", day: 1 },
];

let allThrew = true;
for (const combo of invalidCombos) {
  try {
    selectTemplate({ contentType: combo.type, dayNumber: combo.day });
    console.log(`  FAIL: ${combo.type} day ${combo.day} did not throw`);
    allThrew = false;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  OK: ${combo.type} day ${combo.day} → threw: "${msg}"`);
  }
}

if (!allThrew) {
  console.error("\nFAILED: Some invalid combos did not throw.");
  process.exit(1);
}

console.log("\nAll tests passed.");
