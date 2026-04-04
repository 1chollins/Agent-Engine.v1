# Agent Engine

Agent Engine is a web app that transforms real estate listing data and professional photos into a complete 14-day social media content package (5 branded static posts, 5 video reels, 4 stories) for Instagram and Facebook. Built for growth-stage realtors (2–5 years licensed, 4–6 deals/month) who lack time or budget for consistent social content. Per-listing pricing at $99–$149.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript strict mode)
- **Styling:** Tailwind CSS
- **Auth & Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI Text:** Claude Haiku API (captions, hashtags)
- **Image Branding:** Bannerbear (branded overlays for posts & stories)
- **Video Generation:** Runway (image-to-video clips)
- **Video Processing:** FFmpeg / Transloadit (stitching, transitions, audio)
- **Payments:** Stripe Checkout
- **Hosting:** Vercel

## Database Tables

- `brand_profiles` — one per user; headshot, logo, colors, tone, contact info
- `listings` — property details (address, beds/baths, price, features, status lifecycle)
- `listing_photos` — uploaded photo metadata; sort_order, is_hero flag
- `content_packages` — one per listing; generation status, piece counts, total cost
- `content_pieces` — 14 per package; day_number, content_type, captions, asset paths
- `payments` — Stripe session/intent IDs, amount_cents, receipt URL
- `cost_logs` — every external API call logged for COGS tracking (server-side only)

## Supabase Storage Buckets

- `brand-assets` — headshots and logos (`{user_id}/headshot.ext`, `{user_id}/logo.ext`)
- `listing-photos` — uploaded listing photos (`{user_id}/{listing_id}/{filename}`)
- `generated-content` — output images and videos (`{user_id}/{listing_id}/{type}/...`)

All buckets are private with RLS enforcing user-scoped access.

## Domain Concepts

- **Brand Profile** — realtor's identity (headshot, logo, colors, tone). Created once, applied to all listings.
- **Listing** — a property submission with details + 10–30 uploaded photos. Status: draft → pending_payment → processing → complete/failed.
- **Content Package** — the 14-piece output for one listing. Fixed structure: 5 posts, 5 reels, 4 stories.
- **Content Piece** — one item in the package. Has a day_number (1–14), content_type (post/reel/story), visual asset, and platform-specific captions.

## Folder Structure

```
src/
  app/                    # Next.js App Router pages
    (auth)/               # Login, register, password reset
    (dashboard)/          # Authenticated pages
      brand-profile/      # Brand profile setup/edit
      listings/           # Listing submission, history
      content/            # Content calendar, preview, downloads
      payments/           # Payment history
    api/                  # API routes (webhooks, generation triggers)
  components/             # Shared React components
  lib/                    # Utilities, Supabase client, API helpers
    supabase/             # Supabase client config, typed queries
    generation/           # Content generation pipeline logic
  types/                  # TypeScript type definitions
```

## Coding Rules

- Server Components by default; Client Components only when interactivity requires it
- All API keys in env vars — never exposed client-side
- Supabase RLS enforces data isolation — never trust client-side auth alone
- Store file paths in DB, construct full URLs at render time
- Price stored as integer cents (payments) or whole dollars (listings) — no floats for money
- Generation pipeline must be parallelized — video generation takes 30–120s per clip
- Content pieces use retry_count (max 2 auto-retries) before marking as failed
- All external API calls must be logged to cost_logs

## Do NOT

- Build auto-posting, scheduling, or Meta API integration (v2)
- Build AI avatar content (v2.5)
- Build subscription billing — v1 is per-listing only
- Build content editing or in-app caption modification
- Build team/brokerage accounts or admin dashboard
- Build for TikTok, YouTube, LinkedIn — v1 is Instagram + Facebook only
- Use Pages Router — App Router only
- Skip Stripe for payments — no custom payment handling
- Store credit card data — Stripe handles PCI compliance
- Expose cost_logs to users — internal COGS tracking only

## Current Status

Sprint Spike (API validation) — not yet started. No code has been written.

## Reference Docs

- [Product Overview](docs/product-overview.md) — vision, user persona, content specs, cost analysis
- [PRD](docs/prd.md) — functional requirements, user stories, acceptance criteria
- [Data Model](docs/datamodel.md) — full schema, RLS policies, storage config, SQL
- [Backlog](docs/backlog.md) — 42 P0 stories, 16 P1, 10 P2 with point estimates
- [Sprint Plan](docs/sprintplan.md) — 9-sprint build plan with story assignments
