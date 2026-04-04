# Agent Engine v1 — Backlog

**Product:** Agent Engine v1
**Owner:** Colby Hollins — Frame & Form Studio
**Date:** April 4, 2026
**Total P0 Stories:** 42 (MVP)
**Total P1 Stories:** 16 (Fast Follow)
**Total P2 Stories:** 10 (Future)

---

## Priority Definitions

| Priority | Meaning | When to Build |
|----------|---------|---------------|
| P0 | MVP — must ship for launch | Sprint 0–7 |
| P1 | Fast follow — build within 2–4 weeks after launch | Post-launch |
| P2 | Future — build when revenue justifies it | v1.5+ |

## Story Point Scale

| Points | Meaning |
|--------|---------|
| 1 | Trivial — under 1 hour |
| 2 | Small — 1–3 hours |
| 3 | Medium — half day |
| 5 | Large — full day |
| 8 | Extra large — 2+ days, consider splitting |

---

## Epic 1: Project Foundation

*Infrastructure, deployment, and database setup that everything else depends on.*

### AE-001: Initialize Next.js Project
**Priority:** P0 | **Points:** 3

*As a developer, I need the project scaffolded with the correct tech stack so I can begin building features.*

Acceptance Criteria:
- [ ] Next.js 14 initialized with App Router and TypeScript
- [ ] Tailwind CSS installed and configured
- [ ] ESLint configured with TypeScript rules
- [ ] Folder structure matches CLAUDE.md specification
- [ ] Dev server starts without errors on `npm run dev`
- [ ] .gitignore excludes node_modules, .next, .env.local
- [ ] .env.local.example created with all required environment variable placeholders

---

### AE-002: Configure Supabase Client
**Priority:** P0 | **Points:** 3

*As a developer, I need the database connection configured so the app can read and write data.*

Acceptance Criteria:
- [ ] @supabase/supabase-js installed
- [ ] Browser client configured for client-side usage (using anon key)
- [ ] Server client configured for API routes (using service role key)
- [ ] Environment variables loaded from .env.local
- [ ] Connection test verifies database is reachable
- [ ] Connection test passes in both dev and production environments

---

### AE-003: Deploy Database Schema
**Priority:** P0 | **Points:** 2

*As a developer, I need all database tables, indexes, RLS policies, and triggers deployed to Supabase.*

Acceptance Criteria:
- [ ] All 7 tables created in Supabase (brand_profiles, listings, listing_photos, content_packages, content_pieces, payments, cost_logs)
- [ ] All CHECK constraints are active
- [ ] All indexes are created
- [ ] RLS is enabled on all tables
- [ ] All RLS policies are deployed
- [ ] updated_at triggers are active on brand_profiles and listings
- [ ] Schema matches docs/datamodel.md exactly

---

### AE-004: Create Supabase Storage Buckets
**Priority:** P0 | **Points:** 2

*As a developer, I need storage buckets configured so files can be uploaded and retrieved.*

Acceptance Criteria:
- [ ] brand-assets bucket created (private, 5MB limit, image MIME types)
- [ ] listing-photos bucket created (private, 10MB limit, image MIME types including HEIC)
- [ ] generated-content bucket created (private, 100MB limit, image + video MIME types)
- [ ] Storage RLS policies deployed for all three buckets
- [ ] Test upload and retrieval works for each bucket

---

### AE-005: Deploy to Vercel
**Priority:** P0 | **Points:** 2

*As a developer, I need the app deployed to production so I can test in a real environment throughout the build.*

Acceptance Criteria:
- [ ] GitHub repo connected to Vercel
- [ ] All environment variables configured in Vercel dashboard
- [ ] Production build succeeds without errors
- [ ] Production URL loads the app
- [ ] Automatic deployments trigger on push to main

---

### AE-006: Configure Stripe
**Priority:** P0 | **Points:** 2

*As a developer, I need Stripe configured so the app can accept payments.*

Acceptance Criteria:
- [ ] Stripe account created and API keys stored in .env.local
- [ ] stripe package installed
- [ ] Stripe webhook endpoint configured (local testing via Stripe CLI)
- [ ] Test mode keys used for development, live keys for production
- [ ] Webhook secret stored as environment variable

---

## Epic 2: Authentication

*User registration, login, logout, and session management.*

### AE-100: User Registration
**Priority:** P0 | **Points:** 3

*As a new realtor, I want to create an account so I can use Agent Engine.*

Acceptance Criteria:
- [ ] Registration page at /register with email and password fields
- [ ] Password minimum 8 characters, validated before submission
- [ ] Duplicate email shows clear error message
- [ ] Successful registration redirects to /onboarding (brand profile setup)
- [ ] Supabase Auth confirmation email sends
- [ ] Registration form has clean, professional styling

---

### AE-101: User Login
**Priority:** P0 | **Points:** 3

*As a returning user, I want to sign in to access my content packages.*

Acceptance Criteria:
- [ ] Login page at /login with email and password fields
- [ ] Invalid credentials show clear error message (no specifics about which field is wrong)
- [ ] Successful login redirects to /dashboard
- [ ] If brand profile is incomplete, redirects to /onboarding instead
- [ ] Session persists across page refreshes and browser tabs
- [ ] "Don't have an account?" link to /register

---

### AE-102: Password Reset
**Priority:** P0 | **Points:** 2

*As a user who forgot my password, I want to reset it via email.*

Acceptance Criteria:
- [ ] "Forgot password?" link on login page
- [ ] Reset form accepts email address
- [ ] Supabase sends password reset email
- [ ] Reset link opens a set-new-password page
- [ ] New password must meet same 8-character minimum
- [ ] After reset, user is redirected to login with success message

---

### AE-103: Logout
**Priority:** P0 | **Points:** 1

*As a signed-in user, I want to log out.*

Acceptance Criteria:
- [ ] Logout button visible in the navigation/header on all authenticated pages
- [ ] Clicking logout clears the session and redirects to /login
- [ ] After logout, navigating to a protected page redirects to /login

---

### AE-104: Route Protection
**Priority:** P0 | **Points:** 3

*As a developer, I need all app pages protected so unauthenticated users can't access them.*

Acceptance Criteria:
- [ ] Middleware checks auth state on every protected route
- [ ] Unauthenticated users are redirected to /login
- [ ] Public routes (/, /login, /register, /reset-password) are accessible without auth
- [ ] Auth state is checked server-side, not just client-side

---

## Epic 3: Brand Profile

*One-time brand setup and editing.*

### AE-200: Brand Profile Creation Form
**Priority:** P0 | **Points:** 5

*As a new user, I want to set up my brand profile so my content looks personalized.*

Acceptance Criteria:
- [ ] Onboarding page at /onboarding with all brand profile fields from PRD
- [ ] Required fields are marked and validated before submission
- [ ] Agent name, title, brokerage name, phone, email fields present
- [ ] Tone selector shows 4 options (Professional, Friendly, Luxury, Casual)
- [ ] Website, Instagram handle, Facebook URL fields present (optional)
- [ ] Form cannot be submitted with missing required fields
- [ ] On successful save, brand profile row created in database
- [ ] is_complete flag set to true when all required fields are populated
- [ ] User redirected to /dashboard after saving

---

### AE-201: Headshot Upload
**Priority:** P0 | **Points:** 3

*As a realtor, I want to upload my headshot for use in branded content.*

Acceptance Criteria:
- [ ] File upload field accepts JPG and PNG
- [ ] Preview of selected image displays before saving
- [ ] Image uploads to brand-assets bucket at path {user_id}/headshot.{ext}
- [ ] Files over 5MB are rejected with clear message
- [ ] Non-image files are rejected
- [ ] headshot_path saved to brand_profiles row

---

### AE-202: Logo Upload
**Priority:** P0 | **Points:** 3

*As a realtor, I want to upload my brokerage logo for branded content.*

Acceptance Criteria:
- [ ] File upload field accepts JPG, PNG, SVG
- [ ] Preview of selected image displays before saving
- [ ] Image uploads to brand-assets bucket at path {user_id}/logo.{ext}
- [ ] Files over 5MB are rejected with clear message
- [ ] logo_path saved to brand_profiles row

---

### AE-203: Color Picker
**Priority:** P0 | **Points:** 2

*As a realtor, I want to select my brand colors so content matches my branding.*

Acceptance Criteria:
- [ ] Primary color picker with hex input and visual selector
- [ ] Secondary color picker with hex input and visual selector
- [ ] Accent color picker (optional) with hex input and visual selector
- [ ] Live preview shows the selected colors applied to a sample card
- [ ] Hex values saved to brand_profiles row

---

### AE-204: Edit Brand Profile
**Priority:** P0 | **Points:** 3

*As an existing user, I want to update my brand profile.*

Acceptance Criteria:
- [ ] Settings page at /settings/brand accessible from navigation
- [ ] All fields pre-populate with current saved values
- [ ] Current headshot and logo display with option to replace
- [ ] Changes save successfully with confirmation message
- [ ] is_complete flag recalculated on save

---

### AE-205: Brand Profile Completeness Gate
**Priority:** P0 | **Points:** 2

*As a user with an incomplete brand profile, I should be blocked from listing submission.*

Acceptance Criteria:
- [ ] Navigating to /listings/new checks brand profile completeness
- [ ] If incomplete, user is redirected to /onboarding or /settings/brand
- [ ] Message identifies which required fields are missing
- [ ] After completing profile, user can access listing submission

---

## Epic 4: Listing Submission

*Property details form, photo upload, ordering, and submission confirmation.*

### AE-300: Listing Details Form
**Priority:** P0 | **Points:** 5

*As a realtor, I want to enter my property information for content generation.*

Acceptance Criteria:
- [ ] New listing page at /listings/new with all fields from PRD
- [ ] Property type dropdown with 6 options
- [ ] Price field formats as currency display
- [ ] Bedrooms/bathrooms fields hidden when property_type is vacant_land
- [ ] Key features field is multi-line text
- [ ] Required fields validated before proceeding to photo upload
- [ ] Form data saves to listings table with status 'draft'
- [ ] Draft state persists if user navigates away (auto-save or explicit save)

---

### AE-301: Multi-Photo Upload
**Priority:** P0 | **Points:** 5

*As a realtor, I want to upload my listing photos for content generation.*

Acceptance Criteria:
- [ ] Upload area on the listing form accepts drag-and-drop and file browser
- [ ] Accepts JPG, PNG, HEIC; rejects other types with clear message
- [ ] Rejects files over 10MB per photo with clear message
- [ ] Shows upload progress per photo (progress bar or percentage)
- [ ] Thumbnail previews display for all uploaded photos
- [ ] Minimum 10, maximum 30 photos enforced with clear messaging
- [ ] User can remove individual photos before submission
- [ ] Photos upload to listing-photos bucket at {user_id}/{listing_id}/{filename}
- [ ] listing_photos rows created with file metadata

---

### AE-302: Photo Ordering
**Priority:** P0 | **Points:** 3

*As a realtor, I want to arrange my photos in preferred order.*

Acceptance Criteria:
- [ ] Photo thumbnails can be reordered via drag-and-drop
- [ ] sort_order updates in the database on reorder
- [ ] Order persists on page refresh
- [ ] First photo in order serves as default hero if no hero explicitly selected

---

### AE-303: Hero Photo Selection
**Priority:** P0 | **Points:** 2

*As a realtor, I want to mark my best photo as the hero image.*

Acceptance Criteria:
- [ ] Each thumbnail has a "Set as Hero" button or star icon
- [ ] Only one photo can be hero at a time (selecting a new one deselects the old)
- [ ] Hero photo has a visible badge or border
- [ ] is_hero flag updates in database
- [ ] Default hero is first photo if none explicitly selected

---

### AE-304: Listing Submission Review
**Priority:** P0 | **Points:** 3

*As a realtor, I want to review my listing before paying.*

Acceptance Criteria:
- [ ] Review screen shows all property details in read-only format
- [ ] Photo count and hero photo thumbnail displayed
- [ ] Brand profile summary displayed (name, brokerage, colors preview)
- [ ] "Edit Details" and "Edit Photos" buttons go back to respective sections
- [ ] "Confirm and Pay" button proceeds to payment
- [ ] Cannot confirm with fewer than 10 photos or missing required fields
- [ ] Estimated processing time displayed

---

### AE-305: Listing History Page
**Priority:** P0 | **Points:** 3

*As a realtor, I want to see all my listings and their status.*

Acceptance Criteria:
- [ ] Dashboard at /dashboard shows list of all submitted listings
- [ ] Each listing shows: address, city, submission date, status badge, price paid
- [ ] Status badges color-coded (processing=yellow, complete=green, failed=red)
- [ ] Clicking a listing navigates to its content package
- [ ] Sorted by most recent first
- [ ] "New Listing" button prominently visible
- [ ] Empty state message shown for users with no listings

---

## Epic 5: Payment

*Stripe Checkout integration for per-listing payments.*

### AE-400: Create Stripe Checkout Session
**Priority:** P0 | **Points:** 3

*As a realtor, I want to pay for my content package.*

Acceptance Criteria:
- [ ] API route creates a Stripe Checkout session with the package price
- [ ] Session includes listing address in the description
- [ ] Success URL redirects to /listings/{id}/processing
- [ ] Cancel URL redirects back to /listings/{id}/review
- [ ] Checkout session ID stored in payments table with status 'pending'
- [ ] Listing status updates to 'pending_payment'

---

### AE-401: Stripe Webhook Handler
**Priority:** P0 | **Points:** 5

*As a developer, I need to process Stripe payment confirmations to trigger content generation.*

Acceptance Criteria:
- [ ] Webhook endpoint at /api/webhooks/stripe
- [ ] Verifies Stripe webhook signature
- [ ] Handles checkout.session.completed event
- [ ] Updates payment status to 'succeeded'
- [ ] Stores payment_intent_id and receipt_url
- [ ] Updates listing status to 'processing'
- [ ] Triggers content generation pipeline
- [ ] Handles duplicate webhook deliveries idempotently
- [ ] Logs errors without exposing details to Stripe

---

### AE-402: Payment History Page
**Priority:** P1 | **Points:** 2

*As a realtor, I want to see my payment history.*

Acceptance Criteria:
- [ ] Page at /settings/payments lists all payments
- [ ] Each entry shows: date, amount, property address, receipt link
- [ ] Receipt link opens Stripe hosted receipt in new tab
- [ ] Sorted by most recent first

---

## Epic 6: Content Generation — Text

*Claude Haiku API integration for captions, hashtags, and text content.*

### AE-500: Caption Generation Service
**Priority:** P0 | **Points:** 5

*As a developer, I need a service that generates property-specific captions using Claude Haiku.*

Acceptance Criteria:
- [ ] Service function accepts listing details, brand profile, content type, and day number
- [ ] Generates Instagram caption (150–250 words for posts, 100–150 for reels)
- [ ] Generates Facebook caption (150–250 words for posts, 100–150 for reels)
- [ ] Generates 20–30 relevant hashtags including location tags
- [ ] Captions reference actual property details (address, price, features, neighborhood)
- [ ] Captions written in the agent's selected tone/voice
- [ ] Each caption includes a call-to-action
- [ ] All 14 captions are unique (no duplicates)
- [ ] API call cost logged to cost_logs

---

### AE-501: Story Text Generation
**Priority:** P0 | **Points:** 3

*As a developer, I need story-specific text (teasers and CTAs) generated.*

Acceptance Criteria:
- [ ] Generates teaser text (1–2 lines) per story
- [ ] Generates CTA text per story (e.g., "DM for details", "Link in bio")
- [ ] Generates price callout text
- [ ] Text is property-specific and varies across the 4 stories
- [ ] API call cost logged to cost_logs

---

### AE-502: Reel Text Overlay Generation
**Priority:** P0 | **Points:** 2

*As a developer, I need short text overlay phrases for video reels.*

Acceptance Criteria:
- [ ] Generates 3–5 short phrases per reel highlighting property features
- [ ] Phrases are concise (under 8 words each) for visual overlay readability
- [ ] Phrases are property-specific
- [ ] Stored as JSON array in content_pieces.text_overlay
- [ ] API call cost logged to cost_logs

---

### AE-503: Batch Text Generation
**Priority:** P0 | **Points:** 3

*As a developer, I need all text content for a 14-piece package generated efficiently.*

Acceptance Criteria:
- [ ] Single orchestration function generates text for all 14 pieces
- [ ] Uses minimal API calls (batch multiple pieces per call where possible)
- [ ] Each piece's text content saved to the corresponding content_pieces row
- [ ] Handles partial failures (if one call fails, others still complete)
- [ ] Total text generation completes within 60 seconds
- [ ] All API costs logged

---

## Epic 7: Content Generation — Images

*Bannerbear integration for branded static posts and stories.*

### AE-600: Bannerbear Template Setup
**Priority:** P0 | **Points:** 5

*As a developer, I need Bannerbear templates configured for posts and stories.*

Acceptance Criteria:
- [ ] Post template created in Bannerbear with dynamic layers: background photo, headshot, logo, agent name, brokerage, price, bed/bath/sqft, address, brand color backgrounds
- [ ] Post template outputs 1080x1080 (IG) and 1200x630 (FB) variants
- [ ] Story template created with dynamic layers: background photo, teaser text, price callout, CTA, logo, brand color accents
- [ ] Story template outputs 1080x1920
- [ ] Template IDs stored in environment variables
- [ ] Test generation produces clean output with sample data

---

### AE-601: Static Post Image Generation Service
**Priority:** P0 | **Points:** 5

*As a developer, I need a service that generates branded static post images.*

Acceptance Criteria:
- [ ] Service accepts listing photo URL, brand profile data, and property details
- [ ] Calls Bannerbear API with template and dynamic modifications
- [ ] Generates IG-sized (1080x1080) and FB-sized (1200x630) versions
- [ ] Uploads both versions to generated-content bucket
- [ ] Saves asset_path and asset_path_alt to content_pieces row
- [ ] Text overlays are readable against photo backgrounds
- [ ] Brand colors applied correctly
- [ ] API call cost logged to cost_logs
- [ ] Handles API errors with retry logic (max 2 retries)

---

### AE-602: Story Image Generation Service
**Priority:** P0 | **Points:** 3

*As a developer, I need a service that generates branded story images.*

Acceptance Criteria:
- [ ] Service accepts listing photo URL, brand profile data, teaser text, CTA, and price
- [ ] Calls Bannerbear API with story template
- [ ] Generates 1080x1920 vertical image
- [ ] Uploads to generated-content bucket
- [ ] Saves asset_path to content_pieces row
- [ ] Platform field correctly set (instagram or facebook)
- [ ] API call cost logged to cost_logs
- [ ] Handles API errors with retry logic

---

### AE-603: Photo Selection Logic
**Priority:** P0 | **Points:** 3

*As a developer, I need the system to intelligently assign photos to content pieces.*

Acceptance Criteria:
- [ ] Hero photo assigned to Day 1 post and Day 2 reel
- [ ] Remaining photos distributed across pieces to maximize variety
- [ ] No single photo used in more than 2 content pieces
- [ ] Each reel pulls from a different subset than other reels
- [ ] source_photo_ids array populated on each content_pieces row
- [ ] Works correctly with 10 photos (minimum) and 30 photos (maximum)

---

## Epic 8: Content Generation — Video

*Image-to-video API integration, video stitching, and audio overlay.*

### AE-700: Image-to-Video Generation Service
**Priority:** P0 | **Points:** 8

*As a developer, I need a service that converts listing photos into animated video clips.*

Acceptance Criteria:
- [ ] Service accepts a listing photo URL and sends to Runway or Kling AI API
- [ ] Generates a 3–5 second video clip with dynamic zoom/pan movement
- [ ] Output is 1080x1920 vertical format
- [ ] Clip is downloaded and temporarily stored
- [ ] API call cost logged to cost_logs
- [ ] Handles API timeouts (these calls can take 30–120 seconds)
- [ ] Handles API errors with retry logic (max 2 retries)
- [ ] Processes clips in parallel where possible to reduce total generation time

---

### AE-701: Video Stitching Service
**Priority:** P0 | **Points:** 5

*As a developer, I need a service that stitches multiple clips into a single reel.*

Acceptance Criteria:
- [ ] Service accepts 4–5 video clips for a single reel
- [ ] Clips stitched together with smooth transitions (crossfade or cut)
- [ ] Royalty-free background music added to the final video
- [ ] Text overlays from content_pieces.text_overlay rendered on video
- [ ] Agent logo/watermark placed in corner
- [ ] Final video is 15–30 seconds long
- [ ] Output is 1080x1920 vertical MP4
- [ ] File size under 50MB
- [ ] Uses FFmpeg or Transloadit for processing
- [ ] Final video uploaded to generated-content bucket
- [ ] asset_path saved to content_pieces row
- [ ] API call cost logged to cost_logs

---

### AE-702: Music Library Setup
**Priority:** P0 | **Points:** 2

*As a developer, I need a library of royalty-free music tracks for video reels.*

Acceptance Criteria:
- [ ] 5–10 royalty-free music tracks sourced and stored (Supabase Storage or bundled)
- [ ] Tracks are appropriate for real estate content (upbeat, professional, not distracting)
- [ ] Tracks are properly licensed for commercial use
- [ ] System randomly selects a track per reel (no two consecutive reels use the same track)
- [ ] Audio volume balanced against any video audio at appropriate levels

---

## Epic 9: Content Generation — Orchestration

*Pipeline coordination, status tracking, and error handling.*

### AE-800: Content Generation Pipeline
**Priority:** P0 | **Points:** 8

*As a developer, I need a pipeline that orchestrates the full 14-piece generation process.*

Acceptance Criteria:
- [ ] Pipeline triggered by successful payment webhook
- [ ] Creates content_packages row with status 'processing'
- [ ] Creates 14 content_pieces rows with correct day_number, content_type, platform assignments
- [ ] Assigns recommended_time to each piece based on best-practice schedule
- [ ] Runs photo selection logic (AE-603) to assign photos to pieces
- [ ] Executes text generation for all 14 pieces
- [ ] Executes image generation for 5 posts and 4 stories
- [ ] Executes video generation for 5 reels
- [ ] Parallelizes independent tasks (text gen runs alongside image/video gen)
- [ ] Updates individual piece status as each completes
- [ ] Updates package completed_pieces and failed_pieces counts
- [ ] Sets package status to complete, partial_failure, or failed based on results
- [ ] Aggregates total_cost_usd from cost_logs
- [ ] Full pipeline completes within 10 minutes
- [ ] Processing does not block the web server (runs asynchronously)

---

### AE-801: Generation Status Polling
**Priority:** P0 | **Points:** 3

*As a realtor, I want to see real-time progress of my content generation.*

Acceptance Criteria:
- [ ] Processing page at /listings/{id}/processing
- [ ] Shows overall progress (e.g., "7 of 14 complete")
- [ ] Shows individual piece status indicators for all 14 pieces
- [ ] Status updates via polling (every 5 seconds) without full page refresh
- [ ] When all pieces complete, automatically redirects to content dashboard
- [ ] User can navigate away and return without losing progress

---

### AE-802: Retry Failed Pieces
**Priority:** P0 | **Points:** 3

*As a realtor, I want to retry generating a failed content piece.*

Acceptance Criteria:
- [ ] Failed pieces show a "Retry" button on the dashboard
- [ ] Clicking retry triggers regeneration of only that piece
- [ ] Retry increments retry_count on the content_pieces row
- [ ] Successful retry updates piece status to complete
- [ ] Package status recalculates (partial_failure → complete if all now pass)
- [ ] If retry also fails, error_message updates with latest error

---

## Epic 10: Content Dashboard

*Calendar view, preview, copy, and download functionality.*

### AE-900: Content Calendar View
**Priority:** P0 | **Points:** 5

*As a realtor, I want to see my 14-day content plan laid out visually.*

Acceptance Criteria:
- [ ] Dashboard at /listings/{id}/content
- [ ] 14-day visual grid or timeline layout
- [ ] Each day shows: thumbnail, content type icon (Post/Reel/Story), recommended time
- [ ] Video thumbnails have a play icon overlay
- [ ] Status badges for complete/failed/processing pieces
- [ ] Calendar loads within 1 second after page load
- [ ] Mobile responsive (single column on small screens)

---

### AE-901: Content Preview Modal
**Priority:** P0 | **Points:** 5

*As a realtor, I want to preview each content piece in detail.*

Acceptance Criteria:
- [ ] Clicking any calendar item opens a modal overlay
- [ ] Images display at full resolution
- [ ] Videos play with standard controls (play, pause, volume, fullscreen)
- [ ] Instagram caption shown in a text area
- [ ] Facebook caption shown in a text area
- [ ] Hashtag set shown in a text area
- [ ] Recommended posting date and time displayed
- [ ] Content type and platform labels visible
- [ ] Modal closes on X button, outside click, or Escape key

---

### AE-902: Copy to Clipboard
**Priority:** P0 | **Points:** 2

*As a realtor, I want to copy captions and hashtags to paste into social media.*

Acceptance Criteria:
- [ ] Copy button next to Instagram caption, Facebook caption, and hashtags
- [ ] Clicking copies text to clipboard
- [ ] Visual feedback: button changes to "Copied!" for 2 seconds
- [ ] Copied text preserves line breaks and emoji

---

### AE-903: Individual Asset Download
**Priority:** P0 | **Points:** 2

*As a realtor, I want to download a single content piece.*

Acceptance Criteria:
- [ ] Download button on preview modal and calendar thumbnail
- [ ] Images download as JPG
- [ ] Videos download as MP4
- [ ] Files named descriptively (e.g., day01-post-1080x1080.jpg, day02-reel.mp4)
- [ ] Download triggers native browser save dialog

---

### AE-904: Batch Download (ZIP)
**Priority:** P0 | **Points:** 5

*As a realtor, I want to download all my content at once.*

Acceptance Criteria:
- [ ] "Download All" button visible on dashboard
- [ ] Server generates a ZIP file containing all 14 assets
- [ ] ZIP organized in folders: /posts, /reels, /stories
- [ ] ZIP includes content-calendar.csv with day, type, IG caption, FB caption, hashtags, recommended time
- [ ] Files named by day and type (day01-post.jpg, day02-reel.mp4, etc.)
- [ ] Download button disabled while package is still processing
- [ ] ZIP generation handles large files without timeout

---

### AE-905: Listing Selector
**Priority:** P0 | **Points:** 2

*As a realtor with multiple listings, I want to switch between content packages.*

Acceptance Criteria:
- [ ] Dropdown or sidebar on dashboard shows all listings
- [ ] Each listing shows address and status
- [ ] Selecting a listing loads its content calendar
- [ ] Currently selected listing is highlighted

---

## Epic 11: Landing Page

*Public-facing marketing page.*

### AE-1000: Landing Page
**Priority:** P0 | **Points:** 5

*As a potential customer, I want to understand what Agent Engine does.*

Acceptance Criteria:
- [ ] Public page at / accessible without auth
- [ ] Clear headline and value proposition visible above the fold
- [ ] "How it works" 3-step section (Upload → Generate → Post)
- [ ] Sample content preview (static mockup images of generated output)
- [ ] Pricing section showing per-listing price
- [ ] CTA button linking to /register
- [ ] Testimonial section (placeholder or real if available)
- [ ] Mobile responsive
- [ ] Page loads within 2 seconds
- [ ] Professional design consistent with real estate industry aesthetics

---

## Epic 12: Polish & Error Handling

*Quality, error states, edge cases, and launch readiness.*

### AE-1100: Global Error States
**Priority:** P0 | **Points:** 3

*As a user, I want to see helpful error messages instead of blank screens or crashes.*

Acceptance Criteria:
- [ ] Global error boundary catches unhandled React errors
- [ ] Custom 404 page with navigation back to dashboard
- [ ] Custom 500 page with "something went wrong" message
- [ ] API route errors return structured JSON with appropriate HTTP status codes
- [ ] Form validation errors display inline next to the relevant field

---

### AE-1101: Loading States
**Priority:** P0 | **Points:** 2

*As a user, I want to see loading indicators so I know the app is working.*

Acceptance Criteria:
- [ ] Page-level loading skeleton or spinner on route transitions
- [ ] Button loading state (disabled + spinner) during form submissions
- [ ] Upload progress indicators during photo upload
- [ ] Content generation progress on the processing page

---

### AE-1102: Navigation
**Priority:** P0 | **Points:** 3

*As a user, I want consistent navigation throughout the app.*

Acceptance Criteria:
- [ ] Header with app logo, navigation links, and user menu
- [ ] Navigation links: Dashboard, New Listing, Settings
- [ ] User menu: Brand Profile, Payment History (P1), Logout
- [ ] Active page highlighted in navigation
- [ ] Mobile hamburger menu
- [ ] Consistent across all authenticated pages

---

### AE-1103: Mobile Responsiveness Audit
**Priority:** P0 | **Points:** 3

*As a realtor checking content on my phone, I need the app to work on mobile.*

Acceptance Criteria:
- [ ] All pages functional at 375px width
- [ ] Calendar view switches to single-column on mobile
- [ ] Preview modal is full-screen on mobile
- [ ] Photo upload works on mobile browsers
- [ ] Forms are usable with mobile keyboards
- [ ] No horizontal scrolling on any page

---

## P1 Stories (Fast Follow — Post-Launch)

### AE-P1-01: Email Notification on Package Completion
**Priority:** P1 | **Points:** 3

*As a realtor, I want to be emailed when my content package is ready.*

Acceptance Criteria:
- [ ] Email sent when package status changes to complete or partial_failure
- [ ] Email includes listing address and link to content dashboard
- [ ] Uses Supabase Edge Functions or Resend for email delivery

---

### AE-P1-02: Payment History Page
**Priority:** P1 | **Points:** 2

*Story AE-402 moved to P1 — see Epic 5.*

---

### AE-P1-03: Content Calendar PDF Export
**Priority:** P1 | **Points:** 3

*As a realtor, I want a printable content calendar I can reference.*

Acceptance Criteria:
- [ ] PDF version of the 14-day calendar with thumbnails, captions, and posting times
- [ ] Downloadable from the dashboard alongside the ZIP

---

### AE-P1-04: Regenerate Individual Piece (New Parameters)
**Priority:** P1 | **Points:** 5

*As a realtor, I want to regenerate a piece with a different photo or caption style.*

Acceptance Criteria:
- [ ] User can select a different source photo for a specific piece
- [ ] System regenerates visual and caption for that piece only
- [ ] Previous version is replaced

---

### AE-P1-05: Google OAuth Login
**Priority:** P1 | **Points:** 3

*As a user, I want to sign in with Google for convenience.*

Acceptance Criteria:
- [ ] "Sign in with Google" button on login and registration pages
- [ ] Google OAuth flow handled by Supabase Auth
- [ ] Account links if email already exists

---

### AE-P1-06: Draft Auto-Save
**Priority:** P1 | **Points:** 3

*As a realtor, I want my listing draft saved automatically so I don't lose work.*

Acceptance Criteria:
- [ ] Form auto-saves every 30 seconds while user is editing
- [ ] Draft persists in database with status 'draft'
- [ ] User sees "Draft saved" indicator
- [ ] Returning to an unsaved draft restores all fields including uploaded photos

---

### AE-P1-07: Usage Dashboard
**Priority:** P1 | **Points:** 3

*As a developer, I want to see how the product is being used.*

Acceptance Criteria:
- [ ] Internal dashboard (dev-only) showing: total users, total packages, generation success rate, average COGS per package, revenue to date

---

### AE-P1-08: Image Resizing on Upload
**Priority:** P1 | **Points:** 3

*As a developer, I need uploaded photos resized server-side to optimize storage and generation performance.*

Acceptance Criteria:
- [ ] Photos resized to max 2400px on longest edge
- [ ] Original aspect ratio preserved
- [ ] HEIC converted to JPG on upload
- [ ] Resized version stored; original discarded

---

### AE-P1-09: Posting Time Optimization by Market
**Priority:** P1 | **Points:** 2

*As a realtor, I want posting times optimized for my local market.*

Acceptance Criteria:
- [ ] Recommended times adjusted based on property location timezone
- [ ] Default schedule based on real estate social media best practices

---

### AE-P1-10: Terms of Service and Privacy Policy Pages
**Priority:** P1 | **Points:** 2

*As a user, I want to understand the terms of using Agent Engine.*

Acceptance Criteria:
- [ ] /terms and /privacy pages with basic legal content
- [ ] Links in footer of all pages
- [ ] Registration requires checkbox agreeing to terms

---

### AE-P1-11: Refund Handling
**Priority:** P1 | **Points:** 3

*As a developer, I need to handle refund requests.*

Acceptance Criteria:
- [ ] Stripe webhook handles refund events
- [ ] Payment status updates to 'refunded'
- [ ] Listing content remains accessible after refund (no deletion)

---

### AE-P1-12: SEO Basics for Landing Page
**Priority:** P1 | **Points:** 2

*As a business owner, I want the landing page to rank in search results.*

Acceptance Criteria:
- [ ] Meta title, description, and OG tags on landing page
- [ ] Semantic HTML structure
- [ ] Sitemap.xml generated

---

### AE-P1-13: Rate Limiting on API Routes
**Priority:** P1 | **Points:** 2

*As a developer, I need rate limiting to prevent abuse.*

Acceptance Criteria:
- [ ] API routes limited to 60 requests per minute per user
- [ ] Content generation limited to 5 concurrent packages per user
- [ ] Clear error response when rate limit hit

---

### AE-P1-14: Batch Download Progress Indicator
**Priority:** P1 | **Points:** 2

*As a user, I want to see progress when downloading a large ZIP file.*

Acceptance Criteria:
- [ ] Progress indicator while ZIP is being generated server-side
- [ ] Estimated size displayed before download begins

---

## P2 Stories (Future — v1.5+)

### AE-P2-01: Customizable Content Mix
**Priority:** P2 | **Points:** 8

*As a realtor, I want to choose how many posts, reels, and stories I get.*

---

### AE-P2-02: Subscription Billing
**Priority:** P2 | **Points:** 8

*As a frequent user, I want a subscription plan for volume discounts.*

---

### AE-P2-03: Auto-Post via Buffer/Later
**Priority:** P2 | **Points:** 8

*As a realtor, I want my content automatically posted to my social accounts.*

---

### AE-P2-04: AI Avatar Integration
**Priority:** P2 | **Points:** 13

*As a realtor, I want an AI version of myself presenting properties in video content.*

---

### AE-P2-05: TikTok and YouTube Shorts Output
**Priority:** P2 | **Points:** 5

*As a realtor, I want content formatted for TikTok and YouTube Shorts.*

---

### AE-P2-06: Team/Brokerage Accounts
**Priority:** P2 | **Points:** 8

*As a brokerage manager, I want multiple agents under one account.*

---

### AE-P2-07: Content Performance Analytics
**Priority:** P2 | **Points:** 8

*As a realtor, I want to see which content pieces drive the most engagement.*

---

### AE-P2-08: White Label for Brokerages
**Priority:** P2 | **Points:** 13

*As a brokerage, I want Agent Engine branded as my own tool.*

---

### AE-P2-09: AI Photo Enhancement
**Priority:** P2 | **Points:** 5

*As a realtor with amateur photos, I want AI to enhance my images before generating content.*

---

### AE-P2-10: Referral Program
**Priority:** P2 | **Points:** 5

*As a happy user, I want to refer other agents and get credit.*

---

## Summary

| Priority | Stories | Total Points |
|----------|---------|-------------|
| P0 (MVP) | 42 | ~145 |
| P1 (Fast Follow) | 14 | ~38 |
| P2 (Future) | 10 | ~86 |
| **Total** | **66** | **~269** |

**P0 Estimated Build Time:** 7–8 sprints at 15–20 hours/week (1-week sprints)

---

*End of Backlog — Agent Engine v1*
*Next document: Sprint Plan (sprintplan.md)*
