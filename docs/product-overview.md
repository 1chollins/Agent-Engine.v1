# Agent Engine v1 — Product Overview

## Vision

Agent Engine is a web application that transforms real estate listing data and professional photos into a complete, ready-to-post 14-day social media content package for Facebook and Instagram. It eliminates the single most time-consuming non-selling task in a growth-stage realtor's workflow: creating consistent, high-quality listing content for social media.

---

## The Problem

Mid-level realtors handling 4–6 listings per month know that consistent social media presence drives leads, but they face an impossible time equation:

- Creating quality listing content takes 6–10 hours per property.
- Hiring a social media manager costs $500–$1,500 per listing.
- Using fragmented free tools (Canva, ChatGPT, CapCut) still requires hours of stitching work together.
- The result: most agents post inconsistently, use low-effort content, or abandon social marketing entirely during busy periods — exactly when they should be marketing most.

## The Solution

Agent Engine gives realtors a single upload workflow that produces 14 days of professional, brand-customized content in minutes. One listing input. Fourteen days of output. No creative work required.

---

## Target User

**Primary Persona: The Growth-Stage Realtor**

- Licensed 2–5 years
- Closing 4–6 deals/month
- Working independently or on a small team (no dedicated marketing support)
- Active on Instagram and Facebook but struggling with consistency
- Willing to invest in tools that directly save time
- Located in mid-to-large metro markets (initial focus: Southwest Florida)

---

## Core User Flow

### Step 1: Brand Profile Setup (One-Time)

The realtor creates their brand profile on first login. This profile persists across all future listings.

**Inputs:**
- Agent headshot
- Brokerage logo
- Brand colors (primary, secondary, accent)
- Agent name, title, brokerage name
- Contact information (phone, email, website)
- Social media handles
- Preferred tone/voice (professional, friendly, luxury, casual)

### Step 2: Listing Submission

For each listing, the realtor submits:

**Property Details:**
- Property address
- Property type (single family, condo, townhome, etc.)
- Bedrooms / bathrooms
- Square footage
- Lot size
- Listing price
- Key features / highlights (pool, waterfront, renovated kitchen, etc.)
- Neighborhood / community name
- Any additional notes or selling points

**Photos:**
- Upload 10–20 professional listing photos
- Identify key shots (hero exterior, kitchen, primary suite, etc.) — or let the system auto-select

### Step 3: Content Generation

The system processes the listing submission and generates the full 14-day content package. Processing time target: under 10 minutes.

### Step 4: Dashboard Review

The realtor views their content in a visual 14-day calendar dashboard.

**For each content piece, they see:**
- Preview of the visual asset (static image or video reel)
- Platform-specific caption
- Hashtag set
- Recommended posting date and time
- Content type label (Post / Reel / Story)

**Available actions:**
- Preview individual pieces at full resolution
- Download individual assets
- Download full package (all assets + content calendar)
- Regenerate a specific piece (stretch goal for v1)

---

## Content Package Specification

### 14-Day Package Breakdown (Fixed for v1)

| Day | Content Type | Format | Platform |
|-----|-------------|--------|----------|
| 1 | Static Photo Post | Branded image with overlay | FB + IG |
| 2 | Video Reel | Dynamic walkthrough animation | FB + IG |
| 3 | Story | Branded image/teaser | FB + IG |
| 4 | Static Photo Post | Branded image with overlay | FB + IG |
| 5 | Video Reel | Dynamic walkthrough animation | FB + IG |
| 6 | Story | Branded image/teaser | FB + IG |
| 7 | Static Photo Post | Branded image with overlay | FB + IG |
| 8 | Video Reel | Dynamic walkthrough animation | FB + IG |
| 9 | Story | Branded image/teaser | FB + IG |
| 10 | Static Photo Post | Branded image with overlay | FB + IG |
| 11 | Video Reel | Dynamic walkthrough animation | FB + IG |
| 12 | Story | Branded image/teaser | FB + IG |
| 13 | Static Photo Post | Branded image with overlay | FB + IG |
| 14 | Video Reel | Dynamic walkthrough animation | FB + IG |

**Total per package:**
- 5 branded static photo posts
- 5 dynamic walkthrough video reels
- 4 branded stories

### Content Specifications

**Static Photo Posts:**
- Source: Selected from uploaded listing photos
- Treatment: Branded overlay with agent info, property details, brokerage logo, brand colors
- Dimensions: 1080x1080 (IG feed) + 1200x630 (FB feed)
- Caption: 150–250 words, property-specific, platform-optimized
- Hashtags: 20–30 relevant hashtags (location, property type, lifestyle)

**Video Reels:**
- Source: AI-generated dynamic zoom/walkthrough animations from listing photos
- Clip structure: 4–5 source photos → 3–5 second animated clips each → stitched with transitions
- Duration: 15–30 seconds per reel
- Audio: Licensed royalty-free background music
- Text overlays: Property highlights, price, agent contact
- Branding: Agent headshot/logo watermark
- Dimensions: 1080x1920 (vertical)
- Caption: 100–150 words, engagement-focused, platform-optimized
- Hashtags: 20–30 relevant hashtags

**Stories:**
- Source: Selected listing photos with branded treatment
- Treatment: Teaser-style — bold text, price callout, CTA ("DM for details," "Link in bio")
- Dimensions: 1080x1920 (vertical)
- Branding: Agent headshot, brand colors, logo

### Written Content Requirements

All captions will be:
- Tailored to the specific property (not generic templates)
- Optimized for each platform's algorithm and audience behavior
- Written in the agent's selected tone/voice
- Include a clear call-to-action
- Formatted appropriately (line breaks, emojis used tastefully)

---

## Technical Architecture (High-Level)

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Hosting:** Vercel
- **UI:** Dashboard with calendar view, upload forms, preview modals
- **Auth:** Supabase Auth (email + password, potential Google OAuth)

### Backend & Database
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (listing photos, generated assets)
- **API Routes:** Next.js API routes / Supabase Edge Functions

### AI & Content Generation Pipeline

| Function | Service | Est. Cost Per Call |
|----------|---------|-------------------|
| Caption/hashtag/description generation | Claude Haiku API | ~$0.01–0.03 |
| Image-to-video generation (reels) | Runway / Kling AI / Luma | ~$0.50–2.00 |
| Branded image overlays (static posts + stories) | Bannerbear or custom Canvas API | ~$0.05–0.10 |
| Video stitching + transitions + audio | FFmpeg (self-hosted or Transloadit) | ~$0.05–0.20 |
| Music | Licensed royalty-free library (flat rate) | Variable |

### Orchestration
- **Make.com** or **Inngest** for managing the multi-step generation pipeline
- Queue-based processing to handle generation time gracefully

### Key Data Model (Simplified)

**Users Table**
- user_id, email, name, created_at

**Brand Profiles Table**
- brand_id, user_id, headshot_url, logo_url, primary_color, secondary_color, accent_color, agent_name, title, brokerage, phone, email, website, social_handles, tone_preference

**Listings Table**
- listing_id, user_id, brand_id, address, property_type, beds, baths, sqft, lot_size, price, features, neighborhood, notes, status, created_at

**Listing Photos Table**
- photo_id, listing_id, file_url, is_hero, sort_order, uploaded_at

**Content Packages Table**
- package_id, listing_id, status (processing / complete / failed), created_at, completed_at

**Content Pieces Table**
- piece_id, package_id, day_number, content_type (post / reel / story), visual_asset_url, caption, hashtags, platform, recommended_post_time, created_at

---

## Estimated Cost Per Content Package

| Item | Quantity | Unit Cost | Total |
|------|----------|-----------|-------|
| Caption generation (Claude Haiku) | 14 calls | $0.02 | $0.28 |
| Image-to-video generation | 5 reels × 4–5 clips | $1.00 avg | $20–25 |
| Branded image generation | 9 static/story assets | $0.08 | $0.72 |
| Video stitching/processing | 5 reels | $0.15 | $0.75 |
| **Estimated total COGS per package** | | | **$22–27** |

**Margin analysis at various price points:**

| Price Per Package | COGS | Gross Margin | Margin % |
|-------------------|------|-------------|----------|
| $79 | $25 | $54 | 68% |
| $99 | $25 | $74 | 75% |
| $149 | $25 | $124 | 83% |
| $199 | $25 | $174 | 87% |

**Note:** Infrastructure costs (Vercel, Supabase, Make.com) add ~$50–100/month fixed overhead regardless of volume.

---

## Pricing Strategy (Recommended)

### Per-Listing Model (v1 Launch)

**Standard Package: $99–$149 per listing**
- 14-day content package (5 posts, 5 reels, 4 stories)
- Full brand customization
- Dashboard access with preview + download
- Delivered in under 10 minutes

**Positioning:** Significantly cheaper than hiring a social media manager ($500–$1,500) while saving 6–10 hours of DIY content creation.

### Future Consideration (v1.5+)
- Subscription tiers for volume users (e.g., 5 listings/month for $399)
- Customizable content mix (more reels, fewer posts, etc.) at variable pricing
- Premium add-ons (avatar content, auto-posting)

---

## Product Roadmap

### v1.0 — Content Generation Engine (BUILD THIS)
- Brand profile setup
- Listing submission workflow
- 14-day fixed content package generation
- Visual dashboard with preview + download
- Per-listing pricing

### v1.5 — Customization + Subscriptions
- Configurable content mix per listing
- Subscription plans with volume discounts
- Regeneration of individual content pieces
- Content performance tips/suggestions

### v2.0 — Auto-Posting + Scheduling
- Meta API integration (Facebook + Instagram)
- Built-in scheduling calendar
- Auto-post at optimal times
- Posting analytics dashboard

### v2.5 — AI Avatar Integration
- Agent avatar creation from video training footage
- Avatar-narrated property tours
- Avatar intro/outro clips for reels
- Premium pricing tier

### v3.0 — Multi-Platform + Team
- TikTok, YouTube Shorts, LinkedIn support
- Team/brokerage accounts
- White-label options for brokerages

---

## Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Video generation quality inconsistency | Users get unusable reels | Build review/regeneration capability; test multiple providers; curate which photos work best for video |
| High COGS per package | Thin margins at lower price points | Price at $99+ per listing; optimize provider selection; batch process where possible |
| Slow generation time | Users abandon before seeing output | Queue-based processing with progress indicators; email notification on completion; target <10 min |
| Meta API changes / restrictions | Auto-posting feature (v2) breaks | v1 intentionally avoids API dependency; download-first model is platform-agnostic |
| Low initial adoption | Revenue doesn't justify infrastructure | Launch to DBPR outreach list; leverage existing Frame & Form client relationships; validate with 10 paying users before scaling |
| Scope creep during development | Product never ships | Fixed v1 spec; no feature additions until v1 is live with paying users |

---

## Success Metrics (v1 Launch)

- **Ship date target:** Defined during sprint planning
- **First 10 paying users within 30 days of launch**
- **Content generation reliability:** 95%+ packages complete without manual intervention
- **Generation time:** Under 10 minutes per package
- **User retention:** 50%+ of users submit a second listing within 60 days
- **Gross margin per package:** 70%+

---

## What Comes Next

1. **PRD (Product Requirements Document)** — Detailed functional requirements, user stories, acceptance criteria
2. **Data Model** — Full database schema with relationships and constraints
3. **Story Backlog** — Prioritized user stories organized by sprint
4. **Sprint Plan** — Phased build plan with Windsurf/Cascade prompts
5. **Spike Tests** — Isolated tests of critical API integrations (video generation, image branding) before full build

---

*Document created: April 4, 2026*
*Product: Agent Engine v1*
*Owner: Colby Hollins — Frame & Form Studio*
