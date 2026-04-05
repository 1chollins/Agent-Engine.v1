import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream">
      <h1 className="text-5xl font-bold text-black">Agent Engine</h1>
      <p className="mt-4 text-lg text-gray-600">
        Transform your listings into 14 days of social media content.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/register"
          className="rounded-lg bg-sage px-6 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-sage px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-sage/20"
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}
