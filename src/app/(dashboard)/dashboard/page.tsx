import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-3 text-gray-600">
        Welcome to Agent Engine. Submit a listing to generate your content package.
      </p>
      <div className="mt-8">
        <Link
          href="/listings/new"
          className="inline-block rounded-lg bg-sage px-6 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-sage-dark"
        >
          New Listing
        </Link>
      </div>
    </div>
  );
}
