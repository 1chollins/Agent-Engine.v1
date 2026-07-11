import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyPageData } from "@/lib/property-page";
import { LeadForm } from "@/components/property/lead-form";
import { PROPERTY_TYPES } from "@/types/listing";

type PageProps = { params: { slug: string } };

export const revalidate = 0; // always fresh — signed URLs and view counts

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getPropertyPageData(params.slug);
  if (!data) return { title: "Property not found" };
  const { listing } = data;
  const title = `${listing.address}, ${listing.city}, ${listing.state} — $${listing.price.toLocaleString()}`;
  return {
    title,
    description: listing.features?.slice(0, 160),
    openGraph: { title, images: data.photos[0]?.url ? [data.photos[0].url] : [] },
  };
}

export default async function PropertyPage({ params }: PageProps) {
  const data = await getPropertyPageData(params.slug);
  if (!data) notFound();

  const { listing, brand, photos, reelUrl } = data;
  const hero = photos.find((p) => p.isHero) ?? photos[0];
  const gallery = photos.filter((p) => p !== hero).slice(0, 12);
  const propertyLabel =
    PROPERTY_TYPES.find((t) => t.value === listing.property_type)?.label ??
    listing.property_type;
  const specs = [
    listing.bedrooms != null ? `${listing.bedrooms} Bed` : null,
    listing.bathrooms != null ? `${listing.bathrooms} Bath` : null,
    `${listing.sqft.toLocaleString()} Sqft`,
    listing.year_built ? `Built ${listing.year_built}` : null,
  ].filter(Boolean);
  const features = (listing.features ?? "")
    .split(/[,\n]/)
    .map((f) => f.trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-[#faf8f4] text-black">
      {/* Hero */}
      <div className="relative h-[52vh] min-h-[340px] w-full sm:h-[62vh]">
        {hero && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.url} alt={listing.address} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-5xl px-5 pb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            {propertyLabel} · For Sale
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white sm:text-5xl">
            {listing.address}
          </h1>
          <p className="mt-1 text-lg text-white/90">
            {listing.city}, {listing.state} {listing.zip_code}
          </p>
          <p className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            ${listing.price.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-10">
        {/* Specs strip */}
        <div className="flex flex-wrap gap-3">
          {specs.map((s) => (
            <span
              key={s as string}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium shadow-sm"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-10">
            {/* Features */}
            {features.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold">Highlights</h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span style={{ color: brand.primary_color }} aria-hidden>
                        ◆
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                {listing.neighborhood && (
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">
                    <span className="font-semibold text-black">Neighborhood: </span>
                    {listing.neighborhood}
                  </p>
                )}
              </section>
            )}

            {/* Video tour */}
            {reelUrl && (
              <section>
                <h2 className="text-xl font-semibold">Video Tour</h2>
                <video
                  src={reelUrl}
                  controls
                  playsInline
                  className="mt-4 max-h-[560px] w-auto rounded-2xl shadow-md"
                />
              </section>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold">Gallery</h2>
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {gallery.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={p.url}
                      alt={`Photo ${i + 2}`}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-xl object-cover"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Agent + lead form (sticky on desktop) */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                {brand.headshotUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.headshotUrl}
                    alt={brand.agent_name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold">{brand.agent_name}</p>
                  <p className="text-sm text-gray-500">
                    {brand.agent_title} · {brand.brokerage_name}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{brand.phone}</p>
                </div>
              </div>
              <div className="my-5 h-px bg-black/10" />
              <p className="mb-3 text-sm font-medium">
                Interested in this property? Reach out:
              </p>
              <LeadForm
                slug={params.slug}
                agentName={brand.agent_name.split(" ")[0]}
                accentColor={brand.primary_color}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Powered-by footer */}
      <footer className="border-t border-black/10 bg-white py-6 text-center">
        <a
          href="https://www.frameandformstudio.com"
          className="text-xs text-gray-400 transition-colors hover:text-gray-600"
        >
          Powered by Frame &amp; Form Studio · Listing Studio
        </a>
      </footer>
    </div>
  );
}
