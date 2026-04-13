# Known Issues

Pre-existing bugs discovered during Phase 1 Step 6 testing (April 13, 2026). Not blocking for launch but should be fixed before scaling to paying users.

---

## Bug 1: Silent upload processing failure

**Location:** `src/components/listing/photo-upload.tsx` lines 136-141

**Issue:** `fetch("/api/photos/process")` uses `.catch(() => {})` which swallows all errors including 401s from expired sessions. When this fires, the photo row stays in DB with `width=NULL`, `height=NULL`, `orientation='horizontal'` (the NOT NULL DEFAULT).

**Impact:** Silent data corruption. User has no indication their photo wasn't processed. The picker treats the photo as horizontal even if it's actually vertical, leading to wrong orientation assignment in the content package.

**Observed:** 3 photos uploaded ~00:26 UTC April 13 had NULL dimensions. Backfill script (`npm run backfill:photos`) revealed they were all vertical (4000x6000) but had been classified as horizontal by default.

**Mitigation available:** `npm run backfill:photos` re-processes all photos with NULL width or height via the service role client, bypassing auth.

**Fix approach (later):** Surface processing errors to the user, add retry logic (e.g., 1 retry after 2s delay), or make the call blocking with proper error UI. Alternatively, move orientation detection into the upload API route itself rather than a separate fire-and-forget call.

---

## Bug 2: Sort order race condition on concurrent uploads

**Location:** `src/components/listing/photo-upload.tsx` line 98

**Issue:** `const sortOrder = photos.length + i` — `photos.length` is a stale React state snapshot captured when `handleFiles` is called. If the user drops files in the main zone then immediately drops files in the vertical zone before the first batch completes, both batches compute overlapping `sort_order` values from the same stale `photos.length`.

**Impact:** Duplicate `sort_order` values in the `listing_photos` table. Picker behavior becomes non-deterministic for tied rows (PostgreSQL returns ties in arbitrary order when `ORDER BY sort_order` has duplicates).

**Observed:** DSC08950.jpg and DSC08903.jpg both have `sort_order=25` on listing `2d0895f4-3d83-4383-9352-b9d06b0b4095`.

**Fix approach (later):** Compute `sort_order` server-side on insert (e.g., `SELECT COALESCE(MAX(sort_order), -1) + 1 FROM listing_photos WHERE listing_id = $1`), or serialize upload batches via a mutex flag that disables the drop zones while an upload is in progress (the `uploading` state exists but doesn't actually disable the drop zones).

---

## Post-Launch Roadmap (v1.1+)

### Video-input Creatomate templates

Discovered during Phase 1 Step 6 template selection (April 13). Many Creatomate marketplace templates use video element slots (`Video-N.source`) rather than image slots (`Image-N.source`), which require actual video clips as inputs. These templates cannot be used with the current all-photo pipeline.

To enable video-input templates:
1. Wire Runway multi-clip generation back into the pipeline (currently orphaned in `src/lib/generation/video-single-reel.ts`)
2. Generate 4-5 Runway clips per reel from the photo picker's output
3. Pass Runway clip URLs to `Video-N.source` slots in video-input templates
4. Keep photo-input templates working in parallel (hybrid architecture)

**Cost impact:** +$2-3 per reel using video-input templates (Runway at $0.50/clip × 4-5 clips).

**Deferred because:** Phase 1 scope is to make the realtor's three original complaints (cropping, weak video, repeated photos) go away. Photo-input templates with Creatomate's built-in animation/transitions address "weak video" sufficiently for launch. Video-input templates are a v1.1 upgrade to add more visual variety if user feedback warrants it.

### Creatomate mp4 memory buffering

Creatomate mp4 downloads buffer the full file in memory (2-10MB typical per reel). Finalize phase runs all 5 reels in parallel via `Promise.allSettled`, so peak memory is ~50MB. Acceptable for Vercel. Revisit if template durations exceed 30s, reel count grows, or memory pressure appears in Vercel logs.

### startReelRender is not idempotent

`startReelRender` is not idempotent — Inngest retries on `start-reel-N` step failure will spawn duplicate Creatomate render jobs, costing credits. The function-level config has `retries: 0` but Inngest defaults to 3 retries per individual step. Before launch, either disable retries on `start-reel-N` steps or add an idempotency check (skip if piece status already "processing" or "complete").

### Empty brand asset URLs in Creatomate templates

When `brand_profiles.headshot_path` or `brand_profiles.logo_path` is null, `getBrandAssetUrl` returns an empty string. This passes the `renderReel()` slot validation (which checks key existence, not value) but sends an empty `.source` to Creatomate for required slots like `Picture` (day1_just_listed) and `Brand-Logo` (reel_simple_showcase). Creatomate will render a blank/missing image in those slots. Before launch, either make headshot and logo required in the brand profile form (they're already `NOT NULL` in the schema, so this should only occur if paths are empty strings) or add an explicit check in `startReelRender` that fails early with a clear error.
