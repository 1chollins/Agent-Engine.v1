# Agent Engine v1 — Sprint Plan

**Product:** Agent Engine v1
**Owner:** Colby Hollins — Frame & Form Studio
**Date:** April 4, 2026
**Build Tool:** Claude Code
**Pace:** 15–20 hours/week, 1-week sprints
**Total Sprints:** 9 (1 spike sprint + 8 build sprints)

---

## Sprint Overview

| Sprint | Focus | Stories | Points | Dependency |
|--------|-------|---------|--------|------------|
| Spike | API validation | — | — | None — do this first |
| 0 | Foundation | AE-001 → AE-006 | 14 | None |
| 1 | Auth + Brand Profile | AE-100 → AE-104, AE-200 → AE-205 | 30 | Sprint 0 |
| 2 | Listing Submission | AE-300 → AE-305 | 21 | Sprint 1 (brand gate) |
| 3 | Payment + Generation Scaffold | AE-400, AE-401, AE-800 (scaffold only) | 16 | Sprint 2 |
| 4 | Text Generation | AE-500 → AE-503 | 13 | Sprint 3 |
| 5 | Image Generation | AE-600 → AE-603 | 16 | Sprint 4 |
| 6 | Video Generation | AE-700 → AE-702, AE-800 (complete), AE-801, AE-802 | 29 | Sprint 5 |
| 7 | Dashboard + Downloads | AE-900 → AE-905 | 21 | Sprint 6 |
| 8 | Landing Page + Polish | AE-1000, AE-1100 → AE-1103 | 16 | Sprint 7 |

**Total: ~145 points across 8 build sprints + 1 spike sprint**

---

## Spike Sprint: API Validation (Do This Before Everything)

**Time estimate:** 4–6 hours
**Purpose:** Verify that your three riskiest integrations produce acceptable output before you build an app around them.

You are NOT in Claude Code for this sprint. You're testing APIs directly — using scripts, Postman, or the providers' dashboards.

### Spike 1: Claude Haiku — Caption Generation

**What to test:** Can Claude Haiku produce property-specific, varied captions in the correct tone?

**How to test:**
1. Go to console.anthropic.com
2. Open the Workbench
3. Paste this prompt and run it:

```
You are a real estate social media expert. Generate content for a property listing.

Property: 4 bed / 3 bath single family home
Address: 1842 SW 25th Terrace, Cape Coral, FL 33914
Price: $459,900
Square footage: 2,150
Features: heated pool, updated kitchen with quartz countertops, impact windows, new roof 2023, canal access with boat dock
Neighborhood: Pelican area, Cape Coral
Agent: Sarah Johnson, Realtor at Keller Williams
Tone: Professional

Generate ALL of the following for an Instagram post:
1. Instagram caption (150-250 words, include emoji tastefully, end with CTA)
2. Facebook caption (150-250 words, slightly different style)
3. 25 relevant hashtags (mix of location, property type, lifestyle)

Format as JSON.
```

**Pass criteria:**
- Captions are specific to this property (mention the pool, canal, Cape Coral)
- Tone matches "Professional"
- Instagram and Facebook captions are meaningfully different
- Hashtags include local tags (#CapeCoral, #SWFLRealEstate)
- Total cost per call is under $0.05

**If it fails:** Adjust the system prompt. This is the lowest-risk spike — Claude Haiku handles text generation reliably.

---

### Spike 2: Runway — Image-to-Video Generation

**What to test:** Can Runway turn a static listing photo into a smooth 4-second zoom/pan animation?

**How to test:**
1. Create a Runway account at runwayml.com
2. Get your API key from the dashboard
3. Use their API or web interface to test image-to-video generation
4. Upload 3 different listing photo types:
   - Exterior front of house
   - Kitchen interior
   - Pool/backyard aerial
5. Request a 4-second video with camera motion for each

**Pass criteria:**
- Video has smooth, natural-looking camera movement (zoom or pan)
- No obvious AI artifacts (warped doors, melting furniture, flickering)
- Output is at least 720p quality
- Generation time is under 120 seconds per clip
- Cost per clip is under $2.00

**If it fails:** Test Kling AI as an alternative. If both produce unacceptable quality with real listing photos, you need to pivot the reel strategy to a high-quality Ken Burns slideshow approach using FFmpeg only (no AI video generation). This changes your cost structure dramatically — cheaper but less impressive.

**Important:** Test with REAL listing photos, not stock photos. Stock photos are higher quality and more uniform than what agents will actually upload.

---

### Spike 3: Bannerbear — Branded Image Generation

**What to test:** Can Bannerbear produce professional branded social media posts from a template?

**How to test:**
1. Create a Bannerbear account at bannerbear.com
2. Create a template with these dynamic layers:
   - Background: listing photo (full bleed)
   - Semi-transparent overlay bar at bottom
   - Agent headshot (circular crop, bottom-left)
   - Brokerage logo (bottom-right)
   - Property address (text, white)
   - Price (text, large, white)
   - Bed/bath/sqft line (text, smaller)
   - Brand color accent strip
3. Generate a test image using the API with real property data

**Pass criteria:**
- Text is legible against the photo background
- Brand colors apply correctly
- Headshot and logo render at correct sizes
- Output dimensions match 1080x1080 and 1200x630
- No cropping issues on different photo aspect ratios
- Generation time under 15 seconds
- Cost per image under $0.15

**If it fails:** The most common issue is text readability over light photos. Fix by adding a darker gradient overlay behind text. If Bannerbear itself is problematic, test Placid.app or custom Canvas/Sharp image generation in Node.js (more work but zero per-image cost).

---

### Spike 4: FFmpeg/Transloadit — Video Stitching

**What to test:** Can you stitch multiple video clips together with transitions and audio?

**How to test locally with FFmpeg:**

```bash
# Install FFmpeg
brew install ffmpeg  # Mac
# or: sudo apt install ffmpeg  # Linux

# Concatenate 3 test clips with crossfade transitions
ffmpeg -i clip1.mp4 -i clip2.mp4 -i clip3.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=3.5[v01];[v01][2:v]xfade=transition=fade:duration=0.5:offset=7[outv]" \
  -map "[outv]" -c:v libx264 -pix_fmt yuv420p output.mp4

# Add background music
ffmpeg -i output.mp4 -i music.mp3 \
  -filter_complex "[1:a]volume=0.3[a]" \
  -map 0:v -map "[a]" -shortest -c:v copy -c:a aac final.mp4
```

**Pass criteria:**
- Clips merge smoothly with crossfade transitions
- Audio is balanced (not overpowering)
- Output is valid MP4 playable on mobile
- Output file size is under 50MB for a 20-second video
- Processing time under 30 seconds for 4–5 clips

**If it fails locally:** Test Transloadit's Assembly API with the same workflow. Transloadit handles FFmpeg in the cloud — more reliable but adds per-use cost.

---

### After Spikes: Decision Gate

Before proceeding to Sprint 0, answer these questions:

1. **Video provider:** Runway or Kling? Or fallback to FFmpeg-only Ken Burns?
2. **Image provider:** Bannerbear confirmed, or alternative?
3. **Video stitching:** Local FFmpeg via serverless function, or Transloadit?
4. **Cost per package estimate:** Recalculate based on actual spike test costs. Still under $30?

If any answer is "I don't know," run more spike tests until you do. Do not start Sprint 0 with unresolved technical risks.

---

## Sprint 0: Foundation (Week 1)

**Stories:** AE-001, AE-002, AE-003, AE-004, AE-005, AE-006
**Points:** 14
**Hours estimate:** 8–12
**Dependencies:** None
**Goal:** Empty app running in production with database, storage, and Stripe configured.

### Session Start

```bash
cd agent-engine
claude
```

**Prompt:**

```
Read all documents in /docs (product-overview.md, prd.md, datamodel.md, backlog.md). 

We're starting Sprint 0: Foundation. Here are the stories:

AE-001: Initialize Next.js 14 project with App Router, TypeScript, Tailwind CSS
AE-002: Configure Supabase client (browser + server)
AE-003: Deploy database schema to Supabase
AE-004: Create Supabase storage buckets
AE-005: Deploy to Vercel
AE-006: Configure Stripe

Plan the execution order and let me approve before building.
```

### After Approval

```
Approved. Start with AE-001.
```

### Key Prompts for Sprint 0

**AE-001 — Project Init:**
```
Initialize a Next.js 14 project with App Router and TypeScript. Install Tailwind CSS and configure it. Create the folder structure:

src/
  app/
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    (auth)/reset-password/page.tsx
    (dashboard)/dashboard/page.tsx
    (dashboard)/listings/new/page.tsx
    (dashboard)/listings/[id]/page.tsx
    (dashboard)/settings/page.tsx
    api/webhooks/stripe/route.ts
    layout.tsx
    page.tsx
  components/
    ui/
    forms/
    dashboard/
  lib/
    supabase/
    stripe/
    services/
    utils/
  types/

Create placeholder pages that just render the page name. Verify the dev server starts.
```

**AE-002 — Supabase Client:**
```
Configure the Supabase client. Create two files:

1. src/lib/supabase/client.ts — browser client using anon key
2. src/lib/supabase/server.ts — server client using service role key for API routes

Use environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for the browser client. Use SUPABASE_SERVICE_ROLE_KEY for the server client.

Add a temporary test API route at /api/test-db that verifies the connection works. Run the dev server and test it.
```

**AE-003 — Schema:**
```
Read the SQL schema from /docs/datamodel.md. Create a file at sql/schema.sql containing the full schema. This file is for reference — I'll paste it into Supabase SQL Editor manually.

Also create sql/seed.sql with test data: one test user brand profile, one test listing with placeholder data, and one content package with 14 content piece rows.
```

**AE-005 — Vercel Deploy:**
```
Walk me through what I need to do in Vercel to deploy this. List the exact environment variables I need to set. Make any code changes needed for production builds. After I deploy, tell me how to verify it's working.
```

**AE-006 — Stripe:**
```
Install the stripe package. Create:
1. src/lib/stripe/client.ts — Stripe client configured with the secret key
2. A type file at src/types/stripe.ts with types we'll need for checkout sessions

Set up the Stripe webhook endpoint at src/app/api/webhooks/stripe/route.ts with signature verification. The handler should be a skeleton that logs the event type — we'll add real logic in Sprint 3.
```

### Sprint 0 Completion

```
Sprint 0 is complete. Commit everything, push to main, and summarize what we built and what's next.
```

---

## Sprint 1: Auth + Brand Profile (Week 2)

**Stories:** AE-100 → AE-104, AE-200 → AE-205
**Points:** 30
**Hours estimate:** 15–20
**Dependencies:** Sprint 0 (Supabase client, database schema)
**Goal:** Users can register, login, and create a complete brand profile.

### Session Start

```
Read /docs/backlog.md and /docs/sprintplan.md. We're starting Sprint 1: Auth + Brand Profile.

Stories:
- AE-100: User Registration
- AE-101: User Login
- AE-102: Password Reset
- AE-103: Logout
- AE-104: Route Protection
- AE-200: Brand Profile Creation Form
- AE-201: Headshot Upload
- AE-202: Logo Upload
- AE-203: Color Picker
- AE-204: Edit Brand Profile
- AE-205: Brand Profile Completeness Gate

Plan the execution order. Auth stories first, then brand profile.
```

### Key Prompts for Sprint 1

**Auth Flow:**
```
Build the complete auth flow using Supabase Auth:

1. Registration page at /register — email + password form, validates password length >= 8, on success redirects to /onboarding
2. Login page at /login — email + password form, on success redirects to /dashboard (or /onboarding if brand profile incomplete), shows error on invalid credentials
3. Password reset at /reset-password — email input, triggers Supabase password reset email
4. Logout — button in a shared header component, clears session, redirects to /login

Use Supabase Auth helpers for Next.js App Router. Create middleware.ts for route protection — all routes except /, /login, /register, /reset-password require auth.

Build AE-100, AE-101, AE-102, AE-103, and AE-104 together since they're tightly coupled.
```

**Brand Profile Form:**
```
Build the brand profile creation form at /onboarding. This page should have:

1. Text inputs for: agent_name, agent_title, brokerage_name, phone, email, website, instagram_handle, facebook_url
2. File uploads for headshot and logo (I'll handle these in the next story)
3. Color pickers for primary_color, secondary_color, accent_color — use hex input with a visual color picker
4. Tone selector — radio buttons or select with 4 options: Professional, Friendly, Luxury, Casual
5. Required field validation on: agent_name, agent_title, brokerage_name, phone, email
6. On submit, save to brand_profiles table via Supabase client
7. Set is_complete = true if all required fields + headshot + logo are present
8. Redirect to /dashboard on success

Don't build the file uploads yet — just the form fields and text data persistence.
```

**File Uploads:**
```
Add headshot and logo upload functionality to the brand profile form.

For each:
- Accept JPG, PNG (and SVG for logo only)
- Show a preview of the selected image before saving
- Upload to the brand-assets Supabase Storage bucket at path {user_id}/headshot.{ext} or {user_id}/logo.{ext}
- Reject files over 5MB with clear message
- Save the storage path to headshot_path or logo_path in the brand_profiles row

Build AE-201 and AE-202 together.
```

**Brand Profile Gate:**
```
Build AE-205: Brand Profile Completeness Gate.

When a user navigates to /listings/new, check if their brand profile is_complete is true. If not, redirect them to /onboarding (if no profile exists) or /settings/brand (if profile exists but is incomplete) with a message listing which required fields are missing.
```

### Sprint 1 Completion

```
Sprint 1 is complete. Push everything and summarize. Verify I can:
1. Register a new account
2. Login with that account
3. Complete the brand profile with headshot, logo, colors, and all text fields
4. See the brand profile gate work if I skip setup
5. Edit the brand profile from settings
```

---

## Sprint 2: Listing Submission (Week 3)

**Stories:** AE-300 → AE-305
**Points:** 21
**Hours estimate:** 12–16
**Dependencies:** Sprint 1 (brand profile must exist for listing submission)
**Goal:** Users can create a listing with details and photos, review it, and see it in their listing history.

### Session Start

```
Continue where we left off. Starting Sprint 2: Listing Submission.

Stories: AE-300 through AE-305 — listing details form, multi-photo upload with drag-and-drop, photo ordering, hero photo selection, submission review screen, and listing history page.

Plan the execution order.
```

### Key Prompts for Sprint 2

**Listing Form:**
```
Build AE-300: Listing details form at /listings/new.

Fields from the PRD: address, city, state, zip_code, property_type (dropdown with 6 options), bedrooms, bathrooms, sqft, lot_size, price (formatted as currency), year_built, features (multi-line), neighborhood, hoa_info, additional_notes.

Hide bedrooms and bathrooms when property_type is 'vacant_land'. Validate all required fields. Save to listings table with status 'draft'. The form should save draft state so if the user navigates away, their data isn't lost.

After the form section, show a "Continue to Photos" button that saves the form and scrolls to or navigates to the photo upload section.
```

**Photo Upload:**
```
Build AE-301 and AE-302 together: Multi-photo upload with drag-and-drop and reordering.

Requirements:
- Drag-and-drop zone AND file browser button
- Accept JPG, PNG, HEIC only — reject others with message
- Reject files over 10MB each
- Show upload progress per photo
- Display thumbnail grid of all uploaded photos
- Enforce minimum 10, maximum 30 photos
- Photos upload to listing-photos bucket at {user_id}/{listing_id}/{filename}
- Create listing_photos rows with metadata
- Drag-and-drop reordering of thumbnails that updates sort_order in database
- User can click X on a thumbnail to remove a photo (deletes from storage and database)
```

**Hero Selection:**
```
Build AE-303: Add hero photo selection to the photo upload grid.

Each thumbnail gets a star icon. Clicking it sets that photo as hero (is_hero = true) and removes hero status from any previous selection. The hero photo has a visible gold border or badge. If no hero is explicitly selected, the first photo in sort order is the default hero.
```

**Review + History:**
```
Build AE-304 and AE-305:

AE-304: Review screen at /listings/[id]/review showing all property details (read-only), photo count with hero thumbnail, and brand profile summary. "Edit Details" and "Edit Photos" buttons go back. "Confirm and Pay" button will proceed to payment (just a placeholder button for now — payment comes in Sprint 3).

AE-305: Listing history at /dashboard showing all user's listings in a card or table layout. Each listing shows address, city, date, status badge (color-coded), and amount paid. Sorted most recent first. "New Listing" button at top. Empty state for users with no listings.
```

### Sprint 2 Completion

```
Sprint 2 is complete. Push everything. Verify I can:
1. Create a new listing with all property details
2. Upload 10+ photos with drag-and-drop
3. Reorder photos and select a hero
4. See the review screen with all data
5. View listing history on the dashboard
```

---

## Sprint 3: Payment + Generation Scaffold (Week 4)

**Stories:** AE-400, AE-401, AE-800 (scaffold only)
**Points:** 16
**Hours estimate:** 12–15
**Dependencies:** Sprint 2 (listings must exist to pay for)
**Goal:** Users can pay via Stripe. Payment triggers the content generation pipeline scaffold (creates package + 14 piece rows but doesn't generate actual content yet).

### Session Start

```
Continue where we left off. Starting Sprint 3: Payment + Generation Scaffold.

Stories:
- AE-400: Create Stripe Checkout session
- AE-401: Stripe webhook handler
- AE-800: Content generation pipeline (scaffold only — create the package and piece rows, assign photos, set statuses, but don't call any external generation APIs yet)

Plan the execution order.
```

### Key Prompts for Sprint 3

**Stripe Checkout:**
```
Build AE-400: Stripe Checkout integration.

When the user clicks "Confirm and Pay" on the review screen:
1. API route at /api/checkout creates a Stripe Checkout session
2. Session amount is $99.00 (or whatever we set — use an environment variable PACKAGE_PRICE_CENTS)
3. Session description includes the listing address
4. success_url: /listings/{id}/processing
5. cancel_url: /listings/{id}/review
6. Create a payments row with status 'pending' and the checkout session ID
7. Update listing status to 'pending_payment'
8. Redirect user to Stripe Checkout

Use Stripe's hosted checkout — do NOT build a custom payment form.
```

**Stripe Webhook:**
```
Build AE-401: Complete the Stripe webhook handler at /api/webhooks/stripe.

Handle the checkout.session.completed event:
1. Verify the webhook signature using STRIPE_WEBHOOK_SECRET
2. Find the payment row by stripe_checkout_session_id
3. Update payment status to 'succeeded', save payment_intent_id and receipt_url
4. Update the listing status to 'processing'
5. Call the content generation pipeline function (we'll build the scaffold next)

Handle duplicate webhook deliveries idempotently — if payment is already 'succeeded', skip processing. Return 200 for all handled events.

For local testing, remind me to use the Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Pipeline Scaffold:**
```
Build AE-800 scaffold: Content generation pipeline initialization.

Create a function at src/lib/services/generation/pipeline.ts that:
1. Accepts a listing_id
2. Creates a content_packages row with status 'processing'
3. Runs the photo selection logic — assigns listing photos to content pieces:
   - Hero photo → Day 1 post + Day 2 reel
   - Remaining photos distributed across pieces, no photo used more than twice
4. Creates 14 content_pieces rows with:
   - Correct day_number (1-14)
   - Correct content_type: days 1,4,7,10,13 = post; days 2,5,8,11,14 = reel; days 3,6 = story (instagram); days 9,12 = story (facebook)
   - Status 'pending'
   - Recommended times: posts at 9:00 AM, reels at 12:00 PM, stories at 6:00 PM
   - source_photo_ids populated from photo selection
5. Does NOT call any external APIs yet — that comes in Sprints 4-6
6. Logs the pipeline start to console

The webhook handler should call this function after payment succeeds. This function should be async and NOT block the webhook response — return 200 to Stripe immediately, then process in the background.
```

### Sprint 3 Completion

```
Sprint 3 is complete. Push everything. Verify I can:
1. Click "Confirm and Pay" and be redirected to Stripe Checkout (test mode)
2. Complete a test payment with card 4242 4242 4242 4242
3. Be redirected back to the app
4. See a content_packages row created in Supabase
5. See 14 content_pieces rows with correct types and day assignments
6. See the listing status changed to 'processing'
```

---

## Sprint 4: Text Generation (Week 5)

**Stories:** AE-500 → AE-503
**Points:** 13
**Hours estimate:** 10–14
**Dependencies:** Sprint 3 (pipeline scaffold creates the piece rows that text gen populates)
**Goal:** All 14 content pieces have captions, hashtags, and text overlays generated by Claude Haiku.

### Session Start

```
Continue where we left off. Starting Sprint 4: Text Generation.

Stories:
- AE-500: Caption generation service
- AE-501: Story text generation
- AE-502: Reel text overlay generation
- AE-503: Batch text generation orchestrator

We're integrating Claude Haiku API to generate all written content for the 14-piece package.
```

### Key Prompts for Sprint 4

**Caption Service:**
```
Build AE-500: Caption generation service at src/lib/services/generation/captions.ts.

This service calls the Anthropic API (Claude Haiku) to generate captions. Create a function that:

1. Accepts: listing details, brand profile, content_type (post/reel/story), day_number
2. Constructs a prompt that includes property details, agent info, tone preference, and specific instructions per content type
3. Calls the Anthropic API with model claude-3-5-haiku-20241022
4. Parses the response to extract: instagram_caption, facebook_caption, hashtags
5. For posts: captions are 150-250 words, engagement-focused, property-specific
6. For reels: captions are 100-150 words, video-focused
7. Each caption must reference actual property details and end with a CTA
8. Returns structured data
9. Logs cost to cost_logs table

Use the Anthropic SDK: @anthropic-ai/sdk. The API key is in ANTHROPIC_API_KEY env var.

Important: Each of the 14 captions must be unique. Include the day_number and what the other days cover so the AI avoids repetition.
```

**Batch Orchestrator:**
```
Build AE-503: Batch text generation at src/lib/services/generation/text-batch.ts.

This function generates all text content for a full 14-piece package:
1. Accepts a listing_id
2. Loads listing details and brand profile from database
3. For each of the 14 content pieces, calls the appropriate text generation function:
   - Posts (days 1,4,7,10,13): caption generation (AE-500)
   - Reels (days 2,5,8,11,14): caption generation (AE-500) + text overlay generation (AE-502)
   - Stories (days 3,6,9,12): story text generation (AE-501)
4. Updates each content_pieces row with the generated text
5. Handles partial failures — if one piece fails, continue with the rest
6. Can batch multiple pieces into a single API call to reduce cost (generate 3-4 captions per call)

Integrate this into the pipeline from AE-800. After pipeline creates the piece rows, text generation should run.
```

### Sprint 4 Completion

```
Sprint 4 is complete. Push everything. Verify:
1. Submit a test listing through payment
2. All 14 content pieces have captions and hashtags populated in the database
3. Post captions are 150-250 words and reference actual property details
4. Reel text overlays are short phrases stored as JSON
5. Story pieces have teaser and CTA text
6. All 14 captions are unique
7. Cost logs show Anthropic API calls with costs
```

---

## Sprint 5: Image Generation (Week 6)

**Stories:** AE-600 → AE-603
**Points:** 16
**Hours estimate:** 12–16
**Dependencies:** Sprint 4 (text content must exist for overlays on images)
**Goal:** All 5 static posts and 4 stories have branded images generated.

### Session Start

```
Continue where we left off. Starting Sprint 5: Image Generation.

Stories:
- AE-600: Bannerbear template setup
- AE-601: Static post image generation service
- AE-602: Story image generation service
- AE-603: Photo selection logic refinement

We're integrating Bannerbear to generate branded images.
```

### Key Prompts for Sprint 5

**Bannerbear Service:**
```
Build AE-601: Static post image generation service at src/lib/services/generation/images.ts.

This service calls the Bannerbear API to generate branded post images:

1. Accepts: listing photo URL (from Supabase Storage signed URL), brand profile data, property details
2. Calls Bannerbear API with the post template ID (BANNERBEAR_POST_TEMPLATE_ID env var)
3. Sends dynamic modifications: background_image, headshot_url, logo_url, colors, address, price, bed/bath/sqft text
4. Waits for generation to complete (poll or webhook)
5. Downloads the generated image
6. Uploads to generated-content bucket at {user_id}/{listing_id}/posts/day{XX}-post-1080x1080.jpg
7. Generates the FB variant (1200x630) using the FB template
8. Uploads FB variant to generated-content bucket
9. Updates content_pieces row with asset_path and asset_path_alt
10. Logs cost to cost_logs

Build the same pattern for AE-602 (story generation) using the story template.

Then integrate both into the pipeline — after text generation completes, image generation runs for the 5 posts and 4 stories.
```

### Sprint 5 Completion

```
Sprint 5 is complete. Push everything. Verify:
1. All 5 static post pieces have branded images in Supabase Storage
2. Each post has both IG (1080x1080) and FB (1200x630) versions
3. All 4 stories have branded images at 1080x1920
4. Brand colors, headshot, logo are correctly applied
5. Text overlays are legible
6. Cost logs show Bannerbear API calls
```

---

## Sprint 6: Video Generation (Week 7)

**Stories:** AE-700 → AE-702, AE-800 (complete pipeline), AE-801, AE-802
**Points:** 29
**Hours estimate:** 18–22 (this is the hardest sprint)
**Dependencies:** Sprint 5 (image generation pattern established)
**Goal:** All 5 video reels generated. Full pipeline runs end-to-end. Status tracking and retry work.

### Session Start

```
Continue where we left off. Starting Sprint 6: Video Generation. This is the most complex sprint.

Stories:
- AE-700: Image-to-video generation service
- AE-701: Video stitching service
- AE-702: Music library setup
- AE-800: Complete the full pipeline orchestration
- AE-801: Generation status polling
- AE-802: Retry failed pieces

Plan carefully — AE-700 and AE-701 are the highest-risk stories in the entire project.
```

### Key Prompts for Sprint 6

**Video Generation:**
```
Build AE-700: Image-to-video generation service at src/lib/services/generation/video.ts.

This service converts listing photos into animated video clips:

1. Accepts: listing photo URL (signed URL from Supabase Storage)
2. Calls Runway API to generate a 4-second video with camera motion (zoom/pan)
3. Handles the async nature of Runway — submit job, poll for completion (may take 30-120 seconds)
4. Downloads the completed video clip to temporary storage
5. Returns the local file path of the clip
6. Logs cost to cost_logs
7. Retry logic: max 2 retries on failure
8. Timeout: fail after 180 seconds of polling

Important: This is the slowest API call in the system. For each reel, we need 4-5 clips. That's 20-25 total video generation calls. Process them in parallel (max 5 concurrent) to stay within the 10-minute target.

Use the Runway Gen-3 Alpha Turbo image-to-video endpoint. API key is RUNWAY_API_KEY env var.
```

**Video Stitching:**
```
Build AE-701: Video stitching service at src/lib/services/generation/video-stitch.ts.

This service takes 4-5 video clips and produces a final reel:

1. Accepts: array of video clip file paths, text overlay phrases, music track path, branding data
2. Uses FFmpeg to:
   a. Concatenate clips with crossfade transitions (0.5s each)
   b. Add text overlays (property highlights) at timed intervals
   c. Add agent logo watermark in bottom-right corner
   d. Mix in background music at 30% volume
   e. Output as MP4 at 1080x1920, H.264 codec
3. Uploads final video to generated-content bucket
4. Cleans up temporary clip files
5. Updates content_pieces row with asset_path
6. Logs processing cost

For FFmpeg execution, use fluent-ffmpeg package. If we can't run FFmpeg in Vercel serverless functions (likely), use Transloadit instead and document the switch.
```

**Status Polling:**
```
Build AE-801: Generation status polling.

Create a processing page at /listings/[id]/processing that:
1. Shows overall progress: "Generating content: X of 14 complete"
2. Shows a grid of 14 status indicators (pending/processing/complete/failed icons)
3. Polls an API route at /api/listings/[id]/status every 5 seconds
4. The API route returns: package status, completed count, failed count, and individual piece statuses
5. When all pieces are complete (or package status is complete/partial_failure), redirect to /listings/[id]/content
6. User can navigate away — the page works on return

Also build AE-802: Add a "Retry" button next to any failed piece on the dashboard. Clicking it calls /api/pieces/[id]/retry which re-runs generation for that specific piece only.
```

### Sprint 6 Completion

```
Sprint 6 is complete. Push everything. This is the most critical verification:
1. Submit a listing through the full flow (form → photos → payment)
2. Watch the processing page update in real-time
3. All 5 reels have video files in Supabase Storage
4. Videos play correctly (smooth animation, music, text overlays)
5. The full 14-piece pipeline completes within 10 minutes
6. If a piece fails, the retry button works
7. Cost logs show all API calls with accurate costs
8. Calculate actual COGS per package — is it under $30?
```

---

## Sprint 7: Dashboard + Downloads (Week 8)

**Stories:** AE-900 → AE-905
**Points:** 21
**Hours estimate:** 14–18
**Dependencies:** Sprint 6 (content must be generated to display on dashboard)
**Goal:** Users can view, preview, copy, and download all their generated content.

### Session Start

```
Continue where we left off. Starting Sprint 7: Dashboard + Downloads.

Stories:
- AE-900: Content calendar view
- AE-901: Content preview modal
- AE-902: Copy to clipboard
- AE-903: Individual asset download
- AE-904: Batch download (ZIP)
- AE-905: Listing selector

This is the sprint where the product finally FEELS like a product to the user.
```

### Key Prompts for Sprint 7

**Calendar View:**
```
Build AE-900: Content calendar view at /listings/[id]/content.

Display a 14-day visual grid:
1. Each day is a card showing: thumbnail of the visual asset, content type icon (camera for post, film for reel, lightning for story), day number, recommended posting time
2. Video thumbnails should show a play button overlay
3. Status badges: green checkmark for complete, red X for failed, yellow spinner for processing
4. Cards are clickable — clicking opens the preview modal (AE-901, build next)
5. Grid layout: 7 columns on desktop (2 rows of 7), 2 columns on tablet, 1 column on mobile
6. Load all content piece data in a single query ordered by day_number
7. Generate signed URLs for all asset thumbnails

Make this look polished — this is what the user pays for.
```

**Preview + Copy + Download:**
```
Build AE-901, AE-902, AE-903 together — they're all part of the preview modal.

When a user clicks a calendar card, open a modal that shows:
1. Full-resolution image or video player (with play/pause/volume/fullscreen for videos)
2. Instagram caption in a read-only text area with a "Copy" button
3. Facebook caption in a read-only text area with a "Copy" button
4. Hashtags in a read-only text area with a "Copy" button
5. For stories: show teaser text and CTA text instead of long captions
6. Recommended posting date and time
7. Content type and platform labels
8. "Download" button that downloads the asset file

Copy buttons: on click, copy text to clipboard, change button text to "Copied!" for 2 seconds, then revert. Use navigator.clipboard.writeText().

Download button: trigger a download of the asset from Supabase Storage signed URL. Name files descriptively: day01-post-1080x1080.jpg, day02-reel.mp4, etc.

Modal closes on X, outside click, or Escape key.
```

**Batch Download:**
```
Build AE-904: Batch download as ZIP.

Create an API route at /api/listings/[id]/download that:
1. Verifies the user owns this listing
2. Fetches all 14 content pieces and their assets from Supabase Storage
3. Uses archiver or jszip package to create a ZIP in memory
4. Organizes files in folders: /posts, /reels, /stories
5. Names files by day: day01-post-1080x1080.jpg, day01-post-1200x630.jpg, day02-reel.mp4, etc.
6. Generates a content-calendar.csv with columns: day, content_type, platform, instagram_caption, facebook_caption, hashtags, recommended_time
7. Returns the ZIP as a download response

Add a "Download All" button on the calendar view. Disable it if the package isn't fully complete. Show a loading indicator while the ZIP generates.
```

### Sprint 7 Completion

```
Sprint 7 is complete. Push everything. Full user flow verification:
1. After content generates, the calendar view shows all 14 days
2. Clicking any day opens preview with correct content
3. Copy buttons work for captions and hashtags
4. Individual downloads save correctly named files
5. "Download All" produces a valid ZIP with organized folders and CSV
6. Switching between listings works
7. Everything looks good on mobile
```

---

## Sprint 8: Landing Page + Polish (Week 9)

**Stories:** AE-1000, AE-1100 → AE-1103
**Points:** 16
**Hours estimate:** 12–16
**Dependencies:** Sprint 7 (need screenshots/mockups of the working product for the landing page)
**Goal:** Public landing page live. Error handling complete. Mobile audit passed. READY TO LAUNCH.

### Session Start

```
Continue where we left off. Starting Sprint 8: Landing Page + Polish. This is the final sprint before launch.

Stories:
- AE-1000: Landing page
- AE-1100: Global error states
- AE-1101: Loading states
- AE-1102: Navigation
- AE-1103: Mobile responsiveness audit
```

### Key Prompts for Sprint 8

**Landing Page:**
```
Build AE-1000: Public landing page at /.

This page should convert visitors into signups. Structure:

1. Hero section: headline "14 Days of Listing Content. One Upload." with subheadline explaining the value prop. CTA button "Get Started" linking to /register.

2. "How It Works" section: 3-step visual process
   - Step 1: Upload your listing details and photos (upload icon)
   - Step 2: AI generates 14 days of branded content (sparkle/AI icon)
   - Step 3: Download and post to Instagram & Facebook (download icon)

3. "What You Get" section: showcase the content types
   - 5 branded photo posts
   - 5 dynamic video reels
   - 4 platform-optimized stories
   - Captions, hashtags, and posting schedule included

4. Pricing section: single card showing the per-listing price, what's included

5. Social proof section: placeholder for testimonials (can be empty or have a "Join 50+ SWFL agents" placeholder)

6. Footer CTA: "Stop spending hours on social media. Start closing more deals." with signup button

Design should feel premium, modern, and targeted at real estate professionals. Use clean whites, the brand accent color, and high-contrast text. No generic stock photos — use abstract gradients or geometric backgrounds if no real screenshots are ready.
```

**Error Handling + Navigation:**
```
Build AE-1100, AE-1101, and AE-1102 together.

AE-1100 — Error states:
- Global error boundary component wrapping the app
- Custom 404 page at /not-found with "Back to Dashboard" link
- API routes return consistent error JSON: { error: string, code: string }
- Form validation errors display inline below the relevant field (red text)

AE-1101 — Loading states:
- Page-level loading with skeleton screens or spinner
- Button loading state: disabled + spinner icon during async operations
- All async operations show some form of loading feedback

AE-1102 — Navigation:
- Shared header component on all authenticated pages
- Logo/app name on left (links to /dashboard)
- Nav links: Dashboard, New Listing
- User menu dropdown on right: Brand Profile, Logout
- Active page highlighted
- Mobile: hamburger menu that opens a sidebar or dropdown
```

**Mobile Audit:**
```
Build AE-1103: Run a mobile responsiveness audit.

Go through every page at 375px width and fix issues:
- Landing page
- Login/register forms
- Brand profile form
- Listing submission form
- Photo upload grid
- Review screen
- Processing status page
- Content calendar
- Preview modal (should be full-screen on mobile)
- Download buttons accessible on mobile

Fix any horizontal scrolling, cut-off text, overlapping elements, or unusable form fields. The calendar should be single-column on mobile. The preview modal should be full-screen.
```

### Sprint 8 Completion

```
Sprint 8 is complete. Push everything. Run through the FULL pre-launch checklist from the product overview:

1. Auth flow: register, login, password reset
2. Brand profile: create, edit, completeness gate
3. Listing: form, photos, ordering, hero, review
4. Payment: Stripe Checkout, webhook, confirmation
5. Generation: all 14 pieces complete
6. Dashboard: calendar, preview, copy, download individual, download all
7. Landing page: renders correctly, CTAs work
8. Error states: 404, form errors, API errors
9. Mobile: every page at 375px
10. Production: Vercel deployment stable

List any issues found.
```

---

## CLAUDE.md Template

Create this file at the root of your `agent-engine` project. Claude Code reads it at the start of every session.

```markdown
# Agent Engine

## Overview
Agent Engine is a web app where realtors upload listing photos and property details and receive a 14-day social media content package (5 branded posts, 5 video reels, 4 stories) with platform-specific captions, hashtags, and descriptions for Instagram and Facebook. Per-listing pricing, no auto-posting in v1.

## Tech Stack
- Framework: Next.js 14 (App Router, TypeScript)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (email/password)
- Storage: Supabase Storage (3 buckets: brand-assets, listing-photos, generated-content)
- Payments: Stripe Checkout
- AI Text: Anthropic Claude Haiku API
- AI Video: Runway Gen-3 API
- Image Branding: Bannerbear API
- Video Processing: FFmpeg or Transloadit
- Hosting: Vercel
- Styling: Tailwind CSS

## Database Tables
- brand_profiles — agent branding (headshot, logo, colors, tone)
- listings — property details per listing
- listing_photos — uploaded photo metadata
- content_packages — one package per listing, tracks generation status
- content_pieces — 14 pieces per package, individual content items
- payments — Stripe payment records
- cost_logs — external API call tracking for COGS analysis

## Storage Buckets
- brand-assets: headshots + logos ({user_id}/headshot.ext, {user_id}/logo.ext)
- listing-photos: uploaded listing photos ({user_id}/{listing_id}/{filename})
- generated-content: AI-generated images + videos ({user_id}/{listing_id}/{type}/...)

## Key Domain Concepts
- Brand Profile: agent's visual identity, created once, reused across listings
- Listing: a property submission with details + photos
- Content Package: the 14-piece content bundle generated for a listing
- Content Piece: a single post, reel, or story with visual asset + written content
- Content Calendar: the 14-day posting schedule

## Content Package Structure
- Days 1,4,7,10,13: Static branded photo posts (platform: both)
- Days 2,5,8,11,14: Dynamic walkthrough video reels (platform: both)
- Days 3,6: Stories (platform: instagram)
- Days 9,12: Stories (platform: facebook)

## Coding Rules
- Next.js App Router ONLY — never Pages Router
- Server Components by default — Client Components only when interactive
- Tailwind CSS only — no CSS modules, styled-components, or UI libraries
- TypeScript strict mode — no `any` types
- async/await only — no .then() chains
- Named exports — no default exports (except page.tsx files)
- Functions under 30 lines — split if longer
- All API routes validate input and return typed JSON
- All external API calls wrapped in try/catch with retry logic
- All external API costs logged to cost_logs table
- Supabase client for all database operations — no raw SQL in app code
- RLS handles authorization — don't filter by user_id in queries redundantly

## Do NOT
- Do not install UI libraries (no MUI, Chakra, Radix, shadcn)
- Do not add features not in the v1 backlog
- Do not use Pages Router
- Do not add an ORM (no Prisma, Drizzle)
- Do not build auto-posting, avatar content, or customizable packages
- Do not build admin dashboards
- Do not install packages not listed in tech stack without asking first

## Folder Structure
src/
  app/
    (auth)/          — login, register, reset-password
    (dashboard)/     — dashboard, listings, settings
    api/             — API routes (checkout, webhooks, generation, download)
    layout.tsx
    page.tsx         — landing page
  components/
    ui/              — buttons, modals, inputs, loading states
    forms/           — brand profile form, listing form
    dashboard/       — calendar, preview modal, status indicators
  lib/
    supabase/        — client.ts, server.ts
    stripe/          — client.ts
    services/
      generation/    — pipeline.ts, captions.ts, images.ts, video.ts, video-stitch.ts, text-batch.ts
    utils/           — helpers, formatters
  types/             — TypeScript type definitions

## Planning Docs
- Product Overview: /docs/product-overview.md
- PRD: /docs/prd.md
- Data Model: /docs/datamodel.md
- Backlog: /docs/backlog.md
- Sprint Plan: /docs/sprintplan.md

## Current Status
- Sprint: 0
- Last completed: None
- Next up: AE-001 (Initialize project)
- Known issues: None
```

---

## Dependency Map

```
Sprint 0 (Foundation)
    │
    ▼
Sprint 1 (Auth + Brand Profile)
    │  Depends on: Supabase client, database schema
    ▼
Sprint 2 (Listing Submission)
    │  Depends on: Auth (user must be logged in), Brand Profile (completeness gate)
    ▼
Sprint 3 (Payment + Pipeline Scaffold)
    │  Depends on: Listings exist to pay for
    ▼
Sprint 4 (Text Generation)
    │  Depends on: Pipeline scaffold creates content_pieces rows to populate
    ▼
Sprint 5 (Image Generation)
    │  Depends on: Text content exists for overlay text on images
    ▼
Sprint 6 (Video Generation)
    │  Depends on: Image generation pattern established, pipeline needs all three types
    ▼
Sprint 7 (Dashboard + Downloads)
    │  Depends on: Generated content exists to display and download
    ▼
Sprint 8 (Landing Page + Polish)
       Depends on: Working product exists (for screenshots, full flow testing)
```

**Critical path:** Sprints are strictly sequential. You cannot skip ahead or parallelize sprints because each depends on the prior sprint's output.

---

## Common Pitfalls and Fixes

### 1. Supabase RLS blocks your own API calls

**Symptom:** API routes return empty arrays or "permission denied" even with valid data.

**Cause:** Your server-side API routes are using the anon key instead of the service role key, so RLS policies filter out data.

**Fix:**
```
The API route at [path] is returning empty results. It's using the browser Supabase client instead of the server client. Switch it to use the service role client from src/lib/supabase/server.ts so it bypasses RLS for server-side operations.
```

### 2. Vercel serverless function timeout on video generation

**Symptom:** Video generation API routes timeout after 10 seconds (Vercel's default).

**Cause:** Vercel's free tier has a 10-second function execution limit. Video generation takes 30–120 seconds per clip.

**Fix:** Upgrade to Vercel Pro ($20/month) which gives 60-second limits, OR restructure video generation to use background jobs:
```
The video generation is timing out on Vercel. Restructure it as a background job:
1. API route triggers generation and returns immediately with a job ID
2. Generation runs in a Supabase Edge Function or external worker (not a Vercel serverless function)
3. Status polling checks the database for completion
```

### 3. Runway API returns inconsistent quality

**Symptom:** Some video clips look great, others have artifacts or look weird.

**Cause:** AI video generation quality varies based on the input image. Interior photos with lots of straight lines (kitchens, hallways) tend to produce better results than complex outdoor scenes.

**Fix:** Add quality filtering — after generation, check the output and retry with a different source photo if quality is unacceptable. For v1, accept some variance and let users retry individual pieces.

### 4. Bannerbear text unreadable on light photos

**Symptom:** White text on a bright exterior photo is invisible.

**Fix:** Add a semi-transparent dark gradient overlay behind all text areas in your Bannerbear template. This ensures readability regardless of photo brightness.

### 5. ZIP generation fails on large packages

**Symptom:** Batch download route crashes or times out when building the ZIP with 14 assets (especially 5 video files).

**Cause:** Trying to load all assets into memory at once exceeds serverless function memory limits.

**Fix:**
```
The ZIP generation is running out of memory. Stream the assets instead of loading them all into memory. Use archiver package with streaming mode — pipe each file from Supabase Storage directly into the archive stream without buffering the full file in memory.
```

### 6. Claude Code installs shadcn or other UI libraries

**Symptom:** Claude Code adds @radix-ui, shadcn/ui, or similar packages.

**Fix:**
```
You installed [package]. Remove it. The CLAUDE.md explicitly says no UI libraries. Use Tailwind CSS only for all styling and build custom components.
```

### 7. Content generation completes but webhook doesn't fire

**Symptom:** Stripe payment succeeds but the listing stays in 'pending_payment' status.

**Cause:** Stripe webhook URL is wrong, or webhook signature verification is failing.

**Fix:** During development, always use Stripe CLI for local webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
For production, verify the webhook URL in Stripe Dashboard matches your Vercel deployment URL exactly. Check that STRIPE_WEBHOOK_SECRET is set correctly in Vercel's environment variables.

### 8. HEIC photos break the upload pipeline

**Symptom:** Users upload iPhone photos in HEIC format and the pipeline can't process them.

**Fix:** Convert HEIC to JPEG on upload using the heic-convert package, or handle it server-side. For v1, you can also simply reject HEIC and tell users to upload JPG/PNG — add a note on the upload form. Move HEIC conversion to P1 (AE-P1-08).

### 9. Context window gets bloated in Claude Code

**Symptom:** Claude Code gets confused or slow after working on many stories in one session.

**Fix:**
```
/compact
```
Then:
```
Read CLAUDE.md and /docs/backlog.md. We are on Sprint [X], story [ID]. Continue from there.
```

### 10. Pipeline runs sequentially instead of in parallel

**Symptom:** Content generation takes 25+ minutes because text, image, and video generation run one after another.

**Fix:**
```
The pipeline is running all generation steps sequentially. Restructure it:
1. Text generation runs first (all 14 pieces, ~60 seconds total)
2. After text completes, image generation (9 pieces) and video generation (5 reels × 4-5 clips each) run IN PARALLEL using Promise.allSettled
3. Video stitching runs after all clips for a reel are ready
4. Total target: under 10 minutes
```

---

*End of Sprint Plan — Agent Engine v1*
*All four planning documents are now complete.*
*Next step: Create the repo, add all docs, set up Claude Code, and start building.*
