import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Leads — Listing Studio",
};

type LeadRow = {
  id: string;
  listing_id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  created_at: string;
};

export default async function LeadsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("property_leads")
    .select("id, listing_id, name, email, phone, message, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const typedLeads = (leads ?? []) as LeadRow[];

  // Address lookup for each lead's listing
  const addresses = new Map<string, string>();
  const listingIds = Array.from(new Set(typedLeads.map((l) => l.listing_id)));
  if (listingIds.length > 0) {
    const { data: listings } = await supabase
      .from("listings")
      .select("id, address, city, state")
      .in("id", listingIds);
    for (const l of listings ?? []) {
      addresses.set(l.id as string, `${l.address}, ${l.city}, ${l.state}`);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-black">Leads</h1>
      <p className="mt-1 text-gray-600">
        Buyer inquiries from your property pages — newest first.
      </p>

      {typedLeads.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-gray-400">No leads yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
            Every campaign includes a public property page with a contact form.
            Share the page link in your bio and captions — inquiries land here
            and in your inbox.
          </p>
          <Link
            href="/listings"
            className="mt-6 inline-block rounded-lg bg-forest px-6 py-2.5 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-forest/90"
          >
            View campaigns
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {typedLeads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-forest/15 bg-white/60 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-black">{lead.name}</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    <a href={`mailto:${lead.email}`} className="text-forest hover:underline">
                      {lead.email}
                    </a>
                    {lead.phone && (
                      <>
                        {" · "}
                        <a href={`tel:${lead.phone}`} className="text-forest hover:underline">
                          {lead.phone}
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(lead.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-ink/45">
                {addresses.get(lead.listing_id) ?? "Listing"}
              </p>
              {lead.message && (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
                  {lead.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
