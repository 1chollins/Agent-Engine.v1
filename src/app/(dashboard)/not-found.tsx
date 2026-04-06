import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <span className="text-5xl font-bold text-sage">404</span>
      <h1 className="mt-4 text-xl font-bold text-black">Page Not Found</h1>
      <p className="mt-2 text-sm text-gray-500">
        This page doesn&apos;t exist or you don&apos;t have access.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-sage px-6 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
