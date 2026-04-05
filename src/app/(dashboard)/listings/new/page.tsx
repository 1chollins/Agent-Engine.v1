import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { checkBrandProfileComplete } from "@/lib/brand-profile-check";

export default async function NewListingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const result = await checkBrandProfileComplete(user.id);

  if (!result.complete) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Complete Your Brand Profile First
        </h1>
        <p className="mt-3 text-gray-600">
          You need to complete your brand profile before submitting a listing.
          The following fields are missing:
        </p>
        <ul className="mt-4 space-y-1 text-sm text-red-600">
          {result.missingFields.map((field) => (
            <li key={field}>
              {field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </li>
          ))}
        </ul>
        <Link
          href="/settings/brand"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Complete Brand Profile
        </Link>
      </div>
    );
  }

  // Placeholder for future listing submission form
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900">New Listing</h1>
      <p className="mt-3 text-gray-600">
        Listing submission form coming soon.
      </p>
    </div>
  );
}
