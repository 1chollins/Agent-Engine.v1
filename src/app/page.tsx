import Link from "next/link";
import { MIN_PHOTOS, MAX_PHOTOS } from "@/types/listing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b border-sage/20 bg-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight text-black">
            Agent Engine
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-black/70 transition-colors hover:text-black"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-sage px-5 py-2 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pb-20 pt-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-block rounded-full bg-sage/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sage-darker">
            Built for growth-stage realtors
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-black sm:text-6xl">
            14 Days of Listing Content.{" "}
            <span className="text-sage-darker">One Upload.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
            Upload your listing photos, and we&apos;ll generate 5 branded posts,
            5 video reels, and 4 stories — complete with captions, hashtags,
            and a posting schedule.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="w-full rounded-xl bg-sage px-8 py-3.5 text-base font-semibold text-black shadow-md transition-all hover:bg-sage-dark hover:shadow-lg sm:w-auto"
            >
              Start Your First Package
            </Link>
            <Link
              href="#how-it-works"
              className="w-full rounded-xl border border-sage/40 px-8 py-3.5 text-base font-semibold text-black transition-colors hover:bg-sage/10 sm:w-auto"
            >
              See How It Works
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            No subscription. Pay per listing.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-black">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-gray-500">
            Three simple steps from listing photos to a full content calendar.
          </p>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <StepCard
              number="1"
              title="Upload Your Listing"
              description={`Add property details and upload ${MIN_PHOTOS}-${MAX_PHOTOS} professional photos. Set your brand colors, headshot, and preferred tone.`}
              icon={
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <StepCard
              number="2"
              title="We Generate Everything"
              description="AI writes your captions and hashtags. Your photos become branded posts, video reels with transitions, and eye-catching stories."
              icon={
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <StepCard
              number="3"
              title="Download & Post"
              description="Preview everything, copy captions with one click, and download your full package. Follow our 14-day schedule for maximum engagement."
              icon={
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-black">
            What You Get
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-gray-500">
            A complete 14-day content calendar tailored to your listing.
          </p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ContentCard
              count="5"
              type="Branded Posts"
              description="1080x1080 for Instagram, 1200x630 for Facebook. Your logo, colors, and property details — beautifully designed."
              color="bg-blue-50 border-blue-200 text-blue-700"
            />
            <ContentCard
              count="5"
              type="Video Reels"
              description="Cinematic video clips from your photos, stitched with transitions, text overlays, and background music."
              color="bg-purple-50 border-purple-200 text-purple-700"
            />
            <ContentCard
              count="4"
              type="Stories"
              description="1080x1920 story images with teaser text, price callouts, and CTAs. Ready for Instagram and Facebook Stories."
              color="bg-amber-50 border-amber-200 text-amber-700"
            />
            <ContentCard
              count="14"
              type="Captions + Hashtags"
              description="Unique captions for every piece — Instagram and Facebook versions. Plus 20-30 targeted hashtags per post."
              color="bg-green-50 border-green-200 text-green-700"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-3xl font-bold text-black">
            Simple Per-Listing Pricing
          </h2>
          <p className="mt-3 text-gray-500">
            No subscriptions. No commitments. Pay only for what you need.
          </p>

          <div className="mt-10 rounded-2xl border-2 border-sage bg-cream p-8 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wider text-sage-darker">
              Content Package
            </p>
            <div className="mt-4 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-black">$99</span>
              <span className="text-lg text-gray-500">/ listing</span>
            </div>
            <ul className="mt-6 space-y-3 text-left text-sm text-gray-700">
              <PricingFeature text="5 branded static posts (IG + FB sizes)" />
              <PricingFeature text="5 cinematic video reels with music" />
              <PricingFeature text="4 story images with teasers & CTAs" />
              <PricingFeature text="14 unique captions + hashtag sets" />
              <PricingFeature text="14-day posting schedule" />
              <PricingFeature text="One-click download (ZIP with everything)" />
              <PricingFeature text="Your brand: logo, colors, headshot, tone" />
            </ul>
            <Link
              href="/register"
              className="mt-8 block w-full rounded-xl bg-sage py-3.5 text-center text-base font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
            >
              Get Started Free
            </Link>
            <p className="mt-3 text-xs text-gray-400">
              Create your account free. Only pay when you submit a listing.
            </p>
          </div>
        </div>
      </section>

      {/* Social proof placeholder */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-black">
            Trusted by Growing Agents
          </h2>
          <p className="mt-3 text-gray-500">
            Realtors using Agent Engine close more deals with consistent social content.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <TestimonialCard
              quote="I used to spend 3 hours per listing on social content. Now it takes 5 minutes to upload and I get two weeks of content."
              name="Sarah M."
              title="Realtor, Keller Williams"
            />
            <TestimonialCard
              quote="The video reels are incredible. My engagement went up 40% in the first month. Clients are actually reaching out through Instagram now."
              name="David L."
              title="Broker Associate, RE/MAX"
            />
            <TestimonialCard
              quote="At $99 per listing, it's a no-brainer. I was paying a social media manager $500/month for less content than this."
              name="Michelle K."
              title="Team Lead, Compass"
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-sage/30 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-black">
            Ready to Transform Your Listings?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join hundreds of realtors who save hours every week with automated
            social media content.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-xl bg-sage px-10 py-4 text-base font-semibold text-black shadow-md transition-all hover:bg-sage-dark hover:shadow-lg"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sage/20 bg-cream px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Agent Engine. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/login" className="hover:text-black">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-black">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-sage/20 bg-cream/50 p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/30 text-sm font-bold text-black">
          {number}
        </span>
        <span className="text-sage-darker">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-black">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

function ContentCard({
  count,
  type,
  description,
  color,
}: {
  count: string;
  type: string;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-sage/20 bg-white p-6">
      <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${color}`}>
        {count}x
      </span>
      <h3 className="mt-3 text-lg font-semibold text-black">{type}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-sage-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {text}
    </li>
  );
}

function TestimonialCard({
  quote,
  name,
  title,
}: {
  quote: string;
  name: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-sage/20 bg-white p-6 text-left">
      <p className="text-sm leading-relaxed text-gray-600">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-4 border-t border-sage/10 pt-4">
        <p className="text-sm font-semibold text-black">{name}</p>
        <p className="text-xs text-gray-400">{title}</p>
      </div>
    </div>
  );
}
