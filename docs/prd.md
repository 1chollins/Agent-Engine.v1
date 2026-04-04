# Agent Engine v1 — Product Requirements Document (PRD)

**Product:** Agent Engine v1
**Owner:** Colby Hollins — Frame & Form Studio
**Date:** April 4, 2026
**Status:** Draft

---

## 1. Product Summary

Agent Engine is a web application that transforms real estate listing data and professional photos into a complete, ready-to-post 14-day social media content package for Instagram and Facebook. Realtors upload property details and professional listing photos, and the system generates five branded static photo posts, five dynamic walkthrough-style video reels, and four branded stories — each with platform-specific captions, hashtags, and descriptions. All content is presented in a visual dashboard organized by day where agents can preview and download individual pieces or the full package.

Agent Engine eliminates the single most time-consuming non-selling task in a growth-stage realtor's workflow. Instead of spending 6–10 hours per listing curating social content or paying $500–$1,500 to a social media manager, agents get a professional-grade content package in under 10 minutes.

The product charges per listing at a fixed price point of $99–$149 per content package.

---

## 2. Target User Persona

**Name:** The Growth-Stage Realtor

**Demographics:**
- Licensed 2–5 years
- Closing 4–6 deals per month
- Working independently or on a small team with no dedicated marketing support
- Age range: 28–45
- Comfortable with smartphone apps and basic web tools but not technically advanced
- Located in mid-to-large metro markets (initial launch market: Southwest Florida — Fort Myers, Cape Coral, Naples corridor)

**Behaviors:**
- Active on Instagram and Facebook but posts inconsistently
- Has professional listing photos taken for every property (either self-shot or hired photographer)
- Knows consistent social media presence drives leads but lacks time to execute
- Currently uses a fragmented mix of Canva, ChatGPT, and manual posting — or skips social marketing entirely during busy periods
- Makes purchasing decisions quickly when ROI is obvious and time savings are clear
- Discovers tools through peer recommendations, broker meetings, and industry Facebook groups

**Pain Points:**
- Content creation takes 6–10 hours per listing when done properly
- Hiring a social media manager is expensive and hard to manage
- Free tools require stitching work across multiple platforms
- Quality drops during busy months when time is scarce — exactly when marketing matters most
- Generic templates don't feel personal or property-specific

**Goals:**
- Maintain consistent, professional social media presence without spending time on it
- Stand out from other agents in their market with high-quality content
- Spend more time on revenue-generating activities (prospecting, showing, closing)
- Look polished and tech-savvy to potential sellers during listing presentations

---

## 3. Functional Requirements

### 3.1 Authentication & Account Management

**FR-AUTH-01: User Registration**
Users can create an account using email and password.

**FR-AUTH-02: User Login**
Users can sign in with their registered email and password.

**FR-AUTH-03: Password Reset**
Users can request a password reset via email.

**FR-AUTH-04: Session Management**
Users remain signed in across browser sessions until they explicitly log out. Sessions expire after 30 days of inactivity.

**FR-AUTH-05: Protected Routes**
All application pages except the landing page, login, and registration are protected. Unauthenticated users are redirected to the login page.

---

### 3.2 Brand Profile Management

**FR-BRAND-01: Brand Profile Creation**
On first login, users are prompted to create their brand profile before they can submit a listing. The brand profile form collects:
- Agent headshot (image upload, required)
- Brokerage logo (image upload, required)
- Primary brand color (hex color picker, required)
- Secondary brand color (hex color picker, required)
- Accent brand color (hex color picker, optional)
- Agent full name (text, required)
- Agent title (text, required — e.g., "Realtor," "Broker Associate")
- Brokerage name (text, required)
- Phone number (text, required)
- Email address (text, required)
- Website URL (text, optional)
- Instagram handle (text, optional)
- Facebook page URL (text, optional)
- Preferred tone/voice (single select, required — options: Professional, Friendly, Luxury, Casual, Fun & Engaging)

**FR-BRAND-02: Brand Profile Editing**
Users can edit any field in their brand profile at any time from a settings/profile page. Changes apply to future content packages only — previously generated packages are not retroactively updated.

**FR-BRAND-03: Brand Asset Storage**
Uploaded headshots and logos are stored in Supabase Storage in the `brand-assets` bucket. Images are resized server-side to appropriate dimensions (headshot: 400x400px max, logo: 800x800px max) to prevent oversized files from impacting generation performance.

**FR-BRAND-04: Brand Profile Completeness Check**
Users cannot submit a listing until all required brand profile fields are completed. The system displays which fields are missing and links to the brand profile editor.

---

### 3.3 Listing Submission

**FR-LIST-01: Listing Details Form**
Users submit a new listing by filling out a form with:
- Property address (text, required)
- City (text, required)
- State (text, required)
- ZIP code (text, required)
- Property type (single select, required — options: Single Family Home, Condo, Townhome, Villa, Multi-Family, Vacant Land)
- Bedrooms (number, required for residential)
- Bathrooms (number, required for residential)
- Square footage (number, required)
- Lot size (text, optional — e.g., "0.25 acres")
- Listing price (currency, required)
- Year built (number, optional)
- Key features (multi-line text, required — free-form list of highlights such as "pool," "waterfront," "renovated kitchen," "impact windows")
- Neighborhood or community name (text, optional)
- HOA information (text, optional)
- Additional notes or selling points (multi-line text, optional)

**FR-LIST-02: Multi-Photo Upload**
Users upload 10–30 professional listing photos per listing. The upload interface:
- Accepts JPG, PNG, and HEIC formats
- Shows upload progress per photo
- Allows drag-and-drop and file browser selection
- Enforces minimum of 10 photos and maximum of 30 photos
- Displays thumbnail previews of uploaded photos
- Shows file size and validates maximum 10MB per photo

**FR-LIST-03: Photo Ordering**
Users can drag-and-drop to reorder uploaded photos. The first photo in the order is designated as the hero/primary photo and will be used for the most prominent content pieces.

**FR-LIST-04: Hero Photo Selection**
Users can explicitly mark one photo as the hero image. If no hero is selected, the first photo in the order is used.

**FR-LIST-05: Listing Submission Confirmation**
When the user submits a listing, the system:
1. Validates all required fields are present
2. Validates the brand profile is complete
3. Validates 10–30 photos are uploaded
4. Displays a submission summary for review
5. Requires explicit confirmation before triggering content generation
6. Displays estimated processing time

**FR-LIST-06: Listing History**
Users can view a list of all their submitted listings with status (processing, complete, failed), submission date, property address, and a link to the content package dashboard.

---

### 3.4 Content Generation Pipeline

**FR-GEN-01: Content Package Trigger**
When a listing is confirmed for submission, the system initiates content generation. The pipeline processes all 14 content pieces for the listing.

**FR-GEN-02: Processing Status**
While content is generating, the system displays:
- Overall package status (processing, complete, partial failure, failed)
- Individual piece status for each of the 14 content items
- Progress indicator (e.g., "7 of 14 pieces complete")
- Estimated time remaining (based on average generation times)

**FR-GEN-03: Caption and Hashtag Generation**
For each of the 14 content pieces, the system generates written content using Claude Haiku API:
- **Static posts (5):** Instagram caption (150–250 words), Facebook caption (150–250 words), 20–30 relevant hashtags
- **Video reels (5):** Instagram caption (100–150 words), Facebook caption (100–150 words), 20–30 relevant hashtags, text overlay copy (3–5 short phrases highlighting property features)
- **Stories (4):** Teaser text (1–2 lines), CTA text (e.g., "DM for details," "Link in bio"), price callout text

All written content must be:
- Specific to the property (references actual features, neighborhood, price)
- Written in the agent's selected tone/voice preference
- Optimized per platform (Instagram vs. Facebook style differences)
- Include a clear call-to-action
- Formatted appropriately (line breaks for readability, tasteful emoji usage)
- Unique across the 14 pieces (no repeated captions)

**FR-GEN-04: Branded Static Photo Posts (5 pieces)**
The system generates five branded static images using Bannerbear (or equivalent):
- Source: Five different listing photos selected from the uploaded set
- Brand overlay: Agent headshot, brokerage logo, brand colors applied as background/accent elements
- Property information overlay: Address, price, bed/bath count, key feature highlight
- Agent contact information: Phone, website, or social handle
- Output dimensions: 1080x1080 (Instagram feed) and 1200x630 (Facebook feed) — two versions per post
- Each of the five posts should highlight different aspects of the property (exterior, kitchen, primary suite, backyard/pool, lifestyle/neighborhood)

**FR-GEN-05: Dynamic Walkthrough Video Reels (5 pieces)**
The system generates five video reels:
- Source: For each reel, 4–5 listing photos are sent to the image-to-video API (Runway or Kling AI) to generate 3–5 second animated clips with dynamic zoom/pan movement
- Stitching: The 4–5 clips are stitched together with smooth transitions using FFmpeg or Transloadit
- Audio: Royalty-free background music is added to each reel (from a pre-licensed library)
- Text overlays: Property highlights, price, and agent contact info overlaid on the video
- Branding: Agent headshot or logo watermark in corner
- Duration: 15–30 seconds per reel
- Output dimensions: 1080x1920 (vertical/portrait)
- Each reel should focus on a different property theme (full overview, interior highlights, outdoor living, luxury features, neighborhood/lifestyle)

**FR-GEN-06: Branded Stories (4 pieces — 2 Instagram, 2 Facebook)**
The system generates four story assets split evenly across platforms:
- Source: Four listing photos selected from the uploaded set
- Treatment: Bold text overlay with teaser copy, price callout, CTA
- Branding: Agent brand colors as background/accent, brokerage logo
- Style: Designed to feel urgent/engaging (teaser, not informational)
- Instagram stories: 1080x1920 (vertical), optimized for IG story format
- Facebook stories: 1080x1920 (vertical), optimized for FB story format
- Each platform pair uses different photos and different teaser angles

**FR-GEN-07: Content Calendar Assignment**
Each of the 14 content pieces is assigned to a specific day in the 14-day calendar following this fixed distribution:

| Day | Content Type |
|-----|-------------|
| 1 | Static Photo Post |
| 2 | Video Reel |
| 3 | Story |
| 4 | Static Photo Post |
| 5 | Video Reel |
| 6 | Story |
| 7 | Static Photo Post |
| 8 | Video Reel |
| 9 | Story |
| 10 | Static Photo Post |
| 11 | Video Reel |
| 12 | Story |
| 13 | Static Photo Post |
| 14 | Video Reel |

Each piece is assigned a recommended posting time based on general best practices for real estate social media engagement (e.g., 9:00 AM, 12:00 PM, 6:00 PM local time).

**FR-GEN-08: Photo Selection Logic**
The system intelligently selects which listing photos to use for each content piece:
- Hero photo is used for Day 1 static post and Day 2 reel (first impressions)
- Remaining photos are distributed across content pieces to avoid repetition
- Each reel pulls from a different subset of photos than the other reels
- No single photo is used in more than 2 content pieces across the full package
- If the user uploaded exactly 10 photos, all photos are used; if more than 10, the system selects the most visually diverse set to maximize variety across the 14 content pieces

**FR-GEN-09: Partial Failure Handling**
If individual content pieces fail to generate:
- The package status shows "partial" with a count of successful vs. failed pieces
- Successfully generated pieces are available for preview and download immediately
- Failed pieces display an error message and a "Retry" button
- Retrying a single piece does not regenerate the entire package
- The system attempts up to 2 automatic retries before marking a piece as failed

**FR-GEN-10: Cost Logging**
Every external API call made during content generation is logged:
- Service name (Claude, Runway, Bannerbear, Transloadit)
- API endpoint called
- Cost of the call (in USD)
- Listing ID associated with the call
- Timestamp
- Success or failure status
- Response time (in milliseconds)

---

### 3.5 Content Dashboard & Calendar

**FR-DASH-01: Calendar View**
After content generation completes, the user views their content package in a 14-day visual calendar. Each day shows:
- Thumbnail preview of the visual asset
- Content type icon/label (Post, Reel, Story)
- Recommended posting date
- Recommended posting time
- Status indicator (complete, failed, processing)

**FR-DASH-02: Content Preview**
Clicking on any content piece opens a detailed preview modal showing:
- Full-resolution visual asset (image or video with playback controls)
- Instagram caption (copyable to clipboard)
- Facebook caption (copyable to clipboard)
- Hashtag set (copyable to clipboard)
- Recommended posting time
- Platform dimensions label

**FR-DASH-03: Copy to Clipboard**
Each text element (Instagram caption, Facebook caption, hashtags) has a "Copy" button that copies the text to the user's clipboard with visual confirmation ("Copied!").

**FR-DASH-04: Individual Download**
Users can download any individual content asset (image or video file) directly from the preview modal or the calendar view.

**FR-DASH-05: Batch Download**
Users can download the full content package as a ZIP file containing:
- All 14 visual assets organized in folders by content type (`/posts`, `/reels`, `/stories`)
- A `content-calendar.pdf` or `content-calendar.csv` file listing all 14 days with their captions, hashtags, and recommended posting times
- Files named with the day number and content type for easy identification (e.g., `day01-post.jpg`, `day02-reel.mp4`, `day03-story.jpg`)

**FR-DASH-06: Listing Selector**
If the user has multiple listings, the dashboard shows a listing selector (dropdown or sidebar) to switch between content packages.

**FR-DASH-07: Package Status Page**
While a package is processing, the dashboard shows a status page instead of the calendar. The status page includes:
- Overall progress (e.g., "Generating content: 7 of 14 complete")
- Individual piece progress indicators
- Estimated time remaining
- Option to navigate away and come back (no need to stay on the page)

---

### 3.6 Payment & Billing

**FR-PAY-01: Payment Per Listing**
Users pay per content package before content generation begins. After confirming their listing submission, they are presented with the price and a payment form.

**FR-PAY-02: Payment Processing**
Payments are processed via Stripe Checkout. The system:
- Creates a Stripe Checkout session with the package price
- Redirects the user to Stripe's hosted payment page
- On successful payment, redirects back to the app and triggers content generation
- On failed or cancelled payment, returns the user to the listing submission page with their data preserved

**FR-PAY-03: Payment Confirmation**
After successful payment, the user sees a confirmation screen with:
- Amount charged
- Listing address
- Receipt link (Stripe-hosted)
- Message that content generation has started
- Link to the content dashboard

**FR-PAY-04: Payment History**
Users can view a list of their past payments including date, amount, listing address, and Stripe receipt link.

---

### 3.7 Landing Page & Marketing

**FR-LAND-01: Public Landing Page**
The application has a public landing page (no auth required) that communicates:
- What Agent Engine does (value proposition)
- How it works (3-step visual: Upload → Generate → Post)
- Sample output (example content pieces — can be static mockups initially)
- Pricing
- Call-to-action to sign up
- Social proof placeholder (testimonial section, even if empty at launch)

---

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-PERF-01: Page Load Time**
All application pages load within 2 seconds on a standard broadband connection (25 Mbps).

**NFR-PERF-02: Content Generation Time**
A full 14-piece content package completes generation within 10 minutes of submission. Individual text generation (captions/hashtags) completes within 5 seconds per piece. Image generation completes within 30 seconds per piece. Video generation completes within 120 seconds per clip.

**NFR-PERF-03: Photo Upload Speed**
Uploading 30 photos (average 5MB each, 150MB total) completes within 90 seconds on a standard broadband connection. Upload progress is visible per photo.

**NFR-PERF-04: Dashboard Responsiveness**
The content calendar dashboard renders within 1 second after initial page load. Switching between content pieces in the preview modal is instant (no loading delay).

### 4.2 Security

**NFR-SEC-01: Authentication**
All user sessions are managed by Supabase Auth with secure token handling. Passwords are hashed and never stored in plaintext.

**NFR-SEC-02: API Key Protection**
All third-party API keys (Claude, Runway, Bannerbear, Transloadit, Stripe) are stored as environment variables on the server. They are never exposed to the client-side code or browser.

**NFR-SEC-03: Row-Level Security**
Supabase row-level security policies ensure users can only access their own data — brand profiles, listings, content packages, photos, and payment records. No user can view, edit, or download another user's content.

**NFR-SEC-04: Payment Security**
Payment processing is handled entirely by Stripe. No credit card numbers, CVVs, or financial data touch the Agent Engine server. Stripe handles PCI compliance.

**NFR-SEC-05: File Access Control**
Generated content assets in Supabase Storage are only accessible to the authenticated user who owns the corresponding listing. Direct URL access without authentication is blocked.

### 4.3 Scalability

**NFR-SCALE-01: Concurrent Users**
The system supports at least 50 concurrent users browsing, uploading, and downloading without degradation.

**NFR-SCALE-02: Concurrent Generation**
The system can queue and process at least 10 content packages simultaneously without one job blocking another.

**NFR-SCALE-03: Storage**
The system handles growth to 500 listings (approximately 15,000 uploaded photos and 7,000 generated assets) without architectural changes.

### 4.4 Reliability

**NFR-REL-01: Uptime**
Target 99% uptime during business hours (8 AM – 10 PM EST). Vercel and Supabase infrastructure handles this by default.

**NFR-REL-02: Data Durability**
No user data (brand profiles, listings, generated content) is lost due to system issues. Supabase provides automated daily backups.

**NFR-REL-03: Graceful Degradation**
If an external API (Runway, Bannerbear, etc.) is temporarily unavailable, the system queues the failed pieces for retry rather than failing the entire package.

### 4.5 Usability

**NFR-USE-01: Mobile Responsiveness**
All pages are fully functional and readable on mobile devices (minimum 375px width). Agents will frequently check their content from their phones.

**NFR-USE-02: Browser Support**
The application works in the current versions of Chrome, Safari, Firefox, and Edge.

**NFR-USE-03: Onboarding Time**
A new user can complete brand profile setup and submit their first listing within 15 minutes of creating an account.

---

## 5. User Stories with Acceptance Criteria

### Epic 1: Authentication

**US-AUTH-01: User Registration**
*As a new realtor, I want to create an account so I can use Agent Engine.*

Acceptance Criteria:
- [ ] Registration form accepts email and password
- [ ] Password must be at least 8 characters
- [ ] Duplicate email addresses are rejected with a clear error message
- [ ] After successful registration, user is redirected to the brand profile setup page
- [ ] A confirmation email is sent (Supabase default)

**US-AUTH-02: User Login**
*As a returning user, I want to sign in to access my content packages.*

Acceptance Criteria:
- [ ] Login form accepts email and password
- [ ] Incorrect credentials show a clear error message
- [ ] After successful login, user is redirected to the dashboard (or brand profile setup if incomplete)
- [ ] Session persists across browser tabs and page refreshes

**US-AUTH-03: Password Reset**
*As a user who forgot my password, I want to reset it via email.*

Acceptance Criteria:
- [ ] "Forgot password" link on login page opens a reset form
- [ ] Entering a registered email sends a password reset link
- [ ] Entering an unregistered email does not reveal whether the email exists (security)
- [ ] Reset link expires after 24 hours
- [ ] New password must meet the same requirements as registration

**US-AUTH-04: Logout**
*As a signed-in user, I want to log out of my account.*

Acceptance Criteria:
- [ ] Logout button is visible on all authenticated pages
- [ ] Clicking logout ends the session and redirects to the login page
- [ ] After logout, accessing protected pages redirects to login

---

### Epic 2: Brand Profile

**US-BRAND-01: Create Brand Profile**
*As a new user, I want to set up my brand profile so my content looks personalized.*

Acceptance Criteria:
- [ ] Brand profile form displays all fields listed in FR-BRAND-01
- [ ] Required fields are clearly marked and validated before submission
- [ ] Headshot upload accepts JPG, PNG; previews the image before saving
- [ ] Logo upload accepts JPG, PNG, SVG; previews the image before saving
- [ ] Color picker allows hex input and visual selection for all three color fields
- [ ] Tone selector shows all five options (Professional, Friendly, Luxury, Casual, Fun & Engaging)
- [ ] On submission, all data persists to the database
- [ ] After saving, user is redirected to the dashboard

**US-BRAND-02: Edit Brand Profile**
*As an existing user, I want to update my brand profile when my branding changes.*

Acceptance Criteria:
- [ ] Brand profile is editable from a settings or profile page
- [ ] All fields pre-populate with current saved values
- [ ] Changes save successfully and show a confirmation message
- [ ] Previously uploaded headshot/logo displays; user can replace it
- [ ] Changes do not affect already-generated content packages

**US-BRAND-03: Brand Profile Gate**
*As a user with an incomplete brand profile, I should not be able to submit a listing.*

Acceptance Criteria:
- [ ] Attempting to access listing submission without a complete brand profile redirects to the brand profile editor
- [ ] A message explains which required fields are missing
- [ ] After completing the brand profile, the user can proceed to listing submission

---

### Epic 3: Listing Submission

**US-LIST-01: Submit Listing Details**
*As a realtor, I want to enter my property information so Agent Engine can generate content.*

Acceptance Criteria:
- [ ] Listing form displays all fields listed in FR-LIST-01
- [ ] Required fields are validated before submission
- [ ] Property type dropdown shows all six options
- [ ] Price field formats as currency
- [ ] Key features field accepts multi-line input
- [ ] Form state persists if the user navigates away and returns (draft save)

**US-LIST-02: Upload Listing Photos**
*As a realtor, I want to upload my professional photos for content generation.*

Acceptance Criteria:
- [ ] Upload area accepts drag-and-drop and file browser selection
- [ ] Accepts JPG, PNG, HEIC formats; rejects other file types with a clear message
- [ ] Enforces 10-photo minimum and 30-photo maximum with clear messaging
- [ ] Shows individual upload progress per photo
- [ ] Displays thumbnail previews of all uploaded photos
- [ ] Rejects files over 10MB with a clear message
- [ ] User can remove individual photos before submission

**US-LIST-03: Reorder Photos**
*As a realtor, I want to arrange my photos in the order I prefer so the best ones are featured first.*

Acceptance Criteria:
- [ ] Photos can be reordered via drag-and-drop
- [ ] New order persists when the page is refreshed
- [ ] First photo in the order is used as the default hero unless explicitly set

**US-LIST-04: Select Hero Photo**
*As a realtor, I want to mark my best photo as the hero image for prominent placement.*

Acceptance Criteria:
- [ ] Each photo thumbnail has a "Set as Hero" option
- [ ] Only one photo can be the hero at a time
- [ ] Hero photo has a visible indicator (star, badge, border)
- [ ] Hero designation persists across page refreshes

**US-LIST-05: Review and Confirm Submission**
*As a realtor, I want to review my listing details before paying and generating content.*

Acceptance Criteria:
- [ ] After filling out the form and uploading photos, a review summary shows all entered data
- [ ] Summary includes property details, photo count with thumbnails, and brand profile preview
- [ ] User can go back to edit details or photos
- [ ] "Confirm and Pay" button proceeds to payment
- [ ] Cannot confirm with missing required fields or insufficient photos

**US-LIST-06: View Listing History**
*As a realtor, I want to see all my past listings and their content package status.*

Acceptance Criteria:
- [ ] Dashboard shows a list of all submitted listings
- [ ] Each listing shows: property address, submission date, package status, and price paid
- [ ] Clicking a listing navigates to its content package dashboard
- [ ] Listings are sorted by most recent first

---

### Epic 4: Payment

**US-PAY-01: Pay for Content Package**
*As a realtor, I want to pay for my content package before generation starts.*

Acceptance Criteria:
- [ ] After confirming listing submission, user sees the package price
- [ ] "Pay Now" button redirects to Stripe Checkout
- [ ] Stripe Checkout displays the correct amount and listing description
- [ ] On successful payment, user is redirected back to the app
- [ ] Content generation begins automatically after successful payment
- [ ] On cancelled/failed payment, user returns to the listing page with data intact

**US-PAY-02: View Payment History**
*As a realtor, I want to see my past payments.*

Acceptance Criteria:
- [ ] Payment history page shows all transactions
- [ ] Each entry shows: date, amount, property address, receipt link
- [ ] Receipt link opens Stripe's hosted receipt page

---

### Epic 5: Content Generation

**US-GEN-01: Generate Captions and Hashtags**
*As a realtor, I want property-specific captions and hashtags generated for each content piece.*

Acceptance Criteria:
- [ ] All 14 content pieces have unique, property-specific captions
- [ ] Captions reference actual property details (address, price, features, neighborhood)
- [ ] Captions are written in the agent's selected tone/voice
- [ ] Instagram and Facebook captions differ in style/length
- [ ] Each piece has 20–30 relevant hashtags
- [ ] Hashtags include location-specific tags (city, neighborhood, state)
- [ ] No two pieces have identical captions
- [ ] Each caption includes a call-to-action

**US-GEN-02: Generate Branded Static Posts**
*As a realtor, I want branded photo posts that include my logo, colors, and property info.*

Acceptance Criteria:
- [ ] Five static posts are generated, each using a different listing photo
- [ ] Each post includes: agent headshot, brokerage logo, brand colors, property address, price, bed/bath/sqft
- [ ] Posts are output at 1080x1080 for Instagram and 1200x630 for Facebook
- [ ] Brand colors are applied consistently and legibly
- [ ] Text overlays are readable against the photo background
- [ ] Hero photo is used for the Day 1 post

**US-GEN-03: Generate Video Reels**
*As a realtor, I want dynamic video reels that make my listing photos feel like a walkthrough.*

Acceptance Criteria:
- [ ] Five video reels are generated, each 15–30 seconds long
- [ ] Each reel uses 4–5 different listing photos as source material
- [ ] Photos are animated with dynamic zoom/pan movement (not static slideshows)
- [ ] Clips are stitched together with smooth transitions
- [ ] Background music is included (royalty-free)
- [ ] Text overlays display property highlights
- [ ] Agent logo/watermark is present
- [ ] Output is 1080x1920 vertical format
- [ ] Video files are under 50MB each

**US-GEN-04: Generate Branded Stories**
*As a realtor, I want story content that teases my listing and drives engagement.*

Acceptance Criteria:
- [ ] Four stories are generated — 2 optimized for Instagram, 2 optimized for Facebook
- [ ] Each story uses a different listing photo
- [ ] Each story has bold text overlay with teaser copy
- [ ] Price is prominently displayed
- [ ] CTA text is included (e.g., "DM for details")
- [ ] Agent brand colors are used for background/accent elements
- [ ] Brokerage logo is present
- [ ] All stories are 1080x1920 vertical format
- [ ] Instagram and Facebook story pairs use different photos and teaser angles

**US-GEN-05: Track Generation Progress**
*As a realtor, I want to see how my content package generation is progressing.*

Acceptance Criteria:
- [ ] Status page shows overall progress (e.g., "7 of 14 complete")
- [ ] Each of the 14 content pieces has an individual status indicator
- [ ] Status updates in near-real-time without requiring page refresh
- [ ] User can navigate away and return without losing progress
- [ ] When all pieces complete, the page automatically transitions to the content calendar

**US-GEN-06: Handle Generation Failures**
*As a realtor, I want to know if something failed and have the option to retry.*

Acceptance Criteria:
- [ ] Failed pieces show a clear error message (not a technical stack trace)
- [ ] Each failed piece has a "Retry" button
- [ ] Retrying a piece does not affect other completed pieces
- [ ] After 2 automatic retries, the piece is marked as failed requiring manual retry
- [ ] Successfully completed pieces are available even if others failed

---

### Epic 6: Content Dashboard

**US-DASH-01: View Content Calendar**
*As a realtor, I want to see my 14-day content plan laid out visually.*

Acceptance Criteria:
- [ ] Calendar displays 14 days in a clear visual grid or timeline
- [ ] Each day shows a thumbnail, content type label, and posting time
- [ ] Days with video reels show a video icon overlay on the thumbnail
- [ ] Status indicators differentiate complete, failed, and processing pieces
- [ ] Calendar loads within 1 second

**US-DASH-02: Preview Content Piece**
*As a realtor, I want to preview each content piece before downloading.*

Acceptance Criteria:
- [ ] Clicking any calendar item opens a preview modal
- [ ] Images display at full resolution
- [ ] Videos play with standard controls (play, pause, volume, fullscreen)
- [ ] Instagram caption is displayed and copyable
- [ ] Facebook caption is displayed and copyable
- [ ] Hashtag set is displayed and copyable
- [ ] Recommended posting date and time are visible
- [ ] Modal can be closed to return to the calendar

**US-DASH-03: Copy Caption Text**
*As a realtor, I want to copy captions and hashtags to paste into Instagram and Facebook.*

Acceptance Criteria:
- [ ] Each text block (IG caption, FB caption, hashtags) has a "Copy" button
- [ ] Clicking "Copy" places the text on the clipboard
- [ ] Visual confirmation appears (e.g., button text changes to "Copied!" for 2 seconds)
- [ ] Copied text preserves line breaks and formatting

**US-DASH-04: Download Individual Asset**
*As a realtor, I want to download a single content piece.*

Acceptance Criteria:
- [ ] Download button is available on the preview modal and the calendar thumbnail
- [ ] Clicking download saves the file to the user's device
- [ ] Files are named descriptively (e.g., `day01-post-1080x1080.jpg`)
- [ ] Images download as JPG; videos download as MP4

**US-DASH-05: Download Full Package**
*As a realtor, I want to download all my content at once.*

Acceptance Criteria:
- [ ] "Download All" button is visible on the dashboard
- [ ] Download produces a single ZIP file
- [ ] ZIP contains folders: `/posts`, `/reels`, `/stories`
- [ ] ZIP includes a `content-calendar.csv` with all captions, hashtags, and posting schedule
- [ ] Files are named by day and type
- [ ] Download button is disabled while the package is still processing

**US-DASH-06: Switch Between Listings**
*As a realtor with multiple listings, I want to switch between content packages.*

Acceptance Criteria:
- [ ] Listing selector (dropdown or sidebar) shows all listings
- [ ] Each listing shows property address and status
- [ ] Selecting a listing loads its content calendar
- [ ] Currently selected listing is visually highlighted

---

### Epic 7: Landing Page

**US-LAND-01: View Landing Page**
*As a potential customer, I want to understand what Agent Engine does and how much it costs.*

Acceptance Criteria:
- [ ] Landing page loads without authentication
- [ ] Value proposition is clear within 5 seconds of viewing
- [ ] "How it works" section shows a 3-step visual process
- [ ] Pricing is displayed clearly
- [ ] At least one sample content piece is shown (mockup is acceptable for launch)
- [ ] CTA button links to registration
- [ ] Page is mobile responsive

---

## 6. Out of Scope (v1 Does NOT Include)

The following features are explicitly excluded from v1 and must not be built:

- **Auto-posting to Instagram or Facebook** — No Meta API integration. Users download and post manually.
- **Auto-scheduling** — No built-in scheduling calendar that connects to social platforms.
- **AI avatar content** — No digital agent avatars in videos or images.
- **Customizable content mix** — v1 has a fixed 5/5/4 content package. Users cannot choose more reels or fewer posts.
- **Subscription billing** — v1 is per-listing pricing only. No recurring subscriptions.
- **Content editing** — Users cannot edit captions or modify generated images within the app. They download and edit externally if needed.
- **Content regeneration** — Users cannot regenerate the entire package with different style preferences. Only individual failed pieces can be retried (same parameters).
- **Multi-platform output** — v1 generates for Instagram and Facebook only. No TikTok, YouTube, LinkedIn, or Twitter.
- **Team or brokerage accounts** — v1 is single-user accounts only.
- **Analytics or performance tracking** — No post-performance metrics or engagement tracking.
- **White labeling** — No customizable branding of the Agent Engine platform itself.
- **Admin dashboard** — No internal admin tools for monitoring users or system health (use Supabase dashboard and Stripe dashboard directly).
- **Referral or affiliate programs** — Not in v1.
- **In-app messaging or support chat** — Support handled via email.

---

## 7. Technical Constraints and Assumptions

### Constraints

- **Solo developer build** — All code is written by one person using Claude Code. Architecture must stay simple enough for one person to maintain.
- **Third-party API dependency** — Content quality is limited by what Runway/Kling, Bannerbear, and Claude Haiku can produce. Output quality cannot exceed the capabilities of these services.
- **Video generation latency** — Image-to-video APIs typically take 30–120 seconds per clip. Five reels at 4–5 clips each means 100–600 seconds of video generation time. Total package generation under 10 minutes requires parallel processing.
- **Supabase free tier limits** — Database: 500MB, Storage: 1GB, Auth: 50,000 MAU, Edge Functions: 500K invocations/month. Upgrade to Pro ($25/month) will likely be needed before reaching 50 users.
- **Vercel free tier limits** — 100GB bandwidth/month, serverless function execution time limits. Upgrade to Pro ($20/month) may be needed for video processing routes.

### Assumptions

- Realtors have professional-quality listing photos ready to upload (no AI image enhancement or upscaling needed in v1).
- Realtors are comfortable downloading files and manually posting to Instagram/Facebook.
- The SWFL real estate market is large enough to validate the product before expanding geographically.
- Stripe is available for payment processing in the US market.
- A pre-licensed royalty-free music library can be sourced for $50–$200 flat or through a service with a per-use fee that fits within the COGS estimate.
- The target price point of $99–$149 per listing is acceptable to growth-stage realtors (to be validated).

---

## 8. Success Metrics

### Launch Metrics (First 30 Days)

| Metric | Target |
|--------|--------|
| Paying users | 10 unique users |
| Content packages generated | 20+ packages |
| Generation success rate | 95% of packages complete without manual intervention |
| Generation time | Under 10 minutes per package (average) |
| Revenue | $1,000–$3,000 |

### Growth Metrics (First 90 Days)

| Metric | Target |
|--------|--------|
| Paying users | 30 unique users |
| Repeat usage rate | 50% of users submit a second listing within 60 days |
| Gross margin per package | 70%+ |
| Actual COGS per package | Under $30 |
| Customer acquisition cost | Under $50 (organic/outreach channels) |
| Churn indicator | Fewer than 20% of users request a refund |

### Product Health Metrics (Ongoing)

| Metric | Target |
|--------|--------|
| Uptime | 99% during business hours |
| Average generation time | Under 10 minutes, trending downward |
| Failed generation rate | Under 5% of individual content pieces |
| Support requests per user | Under 1 per month |
| NPS (once measurable) | 40+ |

---

*End of PRD — Agent Engine v1*
*Next document: Data Model (datamodel.md)*
