"use client";

import { useRouter } from "next/navigation";

type ListingOption = {
  id: string;
  address: string;
  city: string;
  state: string;
  status: string;
};

type ListingSelectorProps = {
  listings: ListingOption[];
  currentId: string;
};

export function ListingSelector({ listings, currentId }: ListingSelectorProps) {
  const router = useRouter();

  if (listings.length <= 1) return null;

  return (
    <div className="relative">
      <select
        value={currentId}
        onChange={(e) => router.push(`/listings/${e.target.value}/content`)}
        className="w-full appearance-none rounded-lg border border-sage/30 bg-white py-2 pl-4 pr-10 text-sm font-medium text-black shadow-sm transition-colors hover:border-sage focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
      >
        {listings.map((listing) => (
          <option key={listing.id} value={listing.id}>
            {listing.address}, {listing.city} — {listing.status.replace("_", " ")}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
