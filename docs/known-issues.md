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
