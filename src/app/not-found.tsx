import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
      <span className="text-6xl font-bold text-sage">404</span>
      <h1 className="mt-4 text-2xl font-bold text-black">Page Not Found</h1>
      <p className="mt-2 text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg bg-sage px-6 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-sage/40 px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-sage/10"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
