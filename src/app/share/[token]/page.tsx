import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getBrandProfileForListing } from "@/lib/brand-profile-for-listing";
import { verifyShareToken } from "@/lib/share-token";
import { CopyButton } from "@/components/content/copy-button";
import type { ContentPiece } from "@/types/content";
import type { Listing } from "@/types/listing";
import { audienceOf } from "@/lib/audience";

/**
 * The page an agent gets: their 14-day campaign with every piece, its
 * captions (one-tap copy), when to post it, and downloads. Public, but only
 * reachable with the signed link from the campaign's content page.
 */

export const revalidate = 0; // signed URLs must be fresh

export const metadata: Metadata = {
  title: "Your social campaign · Listing Studio",
  robots: { index: false, follow: false },
};

type PageProps = { params: { token: string } };

const SIGNED_TTL = 60 * 60 * 24; // 24h — the page re-signs on every visit

const TYPE_STYLE: Record<string, { label: string; chip: string }> = {
  post: { label: "Post", chip: "bg-sky-50 text-sky-800 border-sky-200" },
  reel: { label: "Reel", chip: "bg-violet-50 text-violet-800 border-violet-200" },
  story: { label: "Story", chip: "bg-amber-50 text-amber-800 border-amber-200" },
};

function hexOr(value: string | null | undefined, fallback: string): string {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

/**
 * The agent's color, darkened just enough that white text on it (and it as
 * text on white) stays readable — some agents' "primary" is a pale grey or
 * cream. Dark colors pass through unchanged.
 */
function readable(hex: string): string {
  let [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const lum = () =>
    [r, g, b]
      .map((v) => v / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  for (let i = 0; i < 12 && lum() > 0.2; i++) {
    [r, g, b] = [r, g, b].map((v) => v * 0.85);
  }
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

export default async function SharedCampaignPage({ params }: PageProps) {
  const packageId = verifyShareToken(params.token);
  if (!packageId) notFound();

  const supabase = createServiceClient();
  const { data: pkg } = await supabase
    .from("content_packages")
    .select("id, listing_id, status")
    .eq("id", packageId)
    .maybeSingle();
  if (!pkg) notFound();

  const { data: listingRow } = await supabase.from("listings").select("*").eq("id", pkg.listing_id).maybeSingle();
  if (!listingRow) notFound();
  const listing = listingRow as Listing;
  const brand = await getBrandProfileForListing(supabase, listing);
  const isHost = audienceOf(brand) === "host";

  const { data: pieceRows } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("package_id", packageId)
    .order("day_number");
  const pieces = ((pieceRows ?? []) as ContentPiece[]).filter((p) => p.status === "complete" && p.asset_path);

  const slug = listing.address.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const withUrls = await Promise.all(
    pieces.map(async (p) => {
      const ext = p.asset_type === "video" ? "mp4" : "png";
      const name = `${slug}-day${String(p.day_number).padStart(2, "0")}-${p.content_type}.${ext}`;
      const [view, download, alt] = await Promise.all([
        supabase.storage.from("generated-content").createSignedUrl(p.asset_path!, SIGNED_TTL),
        supabase.storage.from("generated-content").createSignedUrl(p.asset_path!, SIGNED_TTL, { download: name }),
        p.asset_path_alt && p.content_type === "post"
          ? supabase.storage.from("generated-content").createSignedUrl(p.asset_path_alt, SIGNED_TTL, {
              download: name.replace(".png", "-facebook.png"),
            })
          : Promise.resolve({ data: null }),
      ]);
      return {
        piece: p,
        viewUrl: view.data?.signedUrl ?? null,
        downloadUrl: download.data?.signedUrl ?? null,
        fbDownloadUrl: alt.data?.signedUrl ?? null,
      };
    })
  );

  const headshot = brand?.headshot_path
    ? (await supabase.storage.from("brand-assets").createSignedUrl(brand.headshot_path, SIGNED_TTL)).data?.signedUrl
    : null;

  const primary = readable(hexOr(brand?.primary_color, "#3d4a2f"));
  const counts = {
    reel: pieces.filter((p) => p.content_type === "reel").length,
    post: pieces.filter((p) => p.content_type === "post").length,
    story: pieces.filter((p) => p.content_type === "story").length,
  };
  const stillMaking = (pkg.status as string) === "processing";

  return (
    <div className="min-h-screen bg-[#faf8f4] text-black">
      {/* Header in the agent's color */}
      <header style={{ backgroundColor: primary }} className="text-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
          <div className="flex items-center gap-4">
            {headshot && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={headshot} alt="" className="h-14 w-14 rounded-full border-2 border-white/80 object-cover" />
            )}
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
              Prepared for {brand?.agent_name ?? "you"}
              {brand?.brokerage_name ? ` · ${brand.brokerage_name}` : ""}
            </p>
          </div>
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight sm:text-5xl">{listing.address}</h1>
          <p className="mt-1 text-white/80">
            {listing.city}, {listing.state} {listing.zip_code}
          </p>
          <p className="mt-5 max-w-2xl text-white/90">
            Your 14-day social campaign: {counts.reel} reels, {counts.post} posts and {counts.story} stories,
            captioned and ready to post. One piece a day, starting the day {isHost ? "you open bookings" : "the listing goes live"}.
          </p>
          <a
            href={`/api/share/${encodeURIComponent(params.token)}/download`}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
            style={{ color: primary }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download everything (.zip)
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        {stillMaking && (
          <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            A few pieces are still being made. Refresh this page in a few minutes.
          </p>
        )}

        {/* How to use */}
        <section className="mb-10 grid gap-4 sm:grid-cols-3">
          {[
            [
              "Post one a day",
              isHost
                ? "Day 1 is the day you start promoting the stay. Each card shows the best time to post."
                : "Day 1 is the day the listing goes live. Each card shows the best time to post.",
            ],
            ["Tap to copy", "Every caption and hashtag set copies with one tap, ready to paste."],
            ["Keep the audio", "Reels already have music and sound. Post them with their original audio."],
          ].map(([title, body], i) => (
            <div key={title} className="rounded-2xl border border-black/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: primary }}>
                Step {i + 1}
              </p>
              <p className="mt-1 font-heading text-xl font-semibold">{title}</p>
              <p className="mt-1 text-sm text-gray-600">{body}</p>
            </div>
          ))}
        </section>

        {/* The 14 days */}
        <section className="space-y-5">
          {withUrls.map(({ piece, viewUrl, downloadUrl, fbDownloadUrl }) => {
            const t = TYPE_STYLE[piece.content_type] ?? TYPE_STYLE.post;
            const isVideo = piece.asset_type === "video";
            const igCaption = [piece.caption_instagram, piece.hashtags].filter(Boolean).join("\n\n");
            return (
              <article
                key={piece.id}
                className="grid gap-5 rounded-2xl border border-black/10 bg-white p-4 sm:grid-cols-[260px_1fr] sm:p-5"
              >
                <div className="overflow-hidden rounded-xl bg-black/5">
                  {viewUrl &&
                    (isVideo ? (
                      <video src={viewUrl} controls playsInline preload="metadata" className="aspect-[9/16] w-full bg-black object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={viewUrl} alt={`Day ${piece.day_number} ${t.label}`} className="w-full object-cover" />
                    ))}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading text-2xl font-semibold">Day {piece.day_number}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${t.chip}`}>{t.label}</span>
                    {piece.recommended_time && (
                      <span className="text-xs text-gray-500">Best time: {piece.recommended_time}</span>
                    )}
                  </div>

                  {piece.content_type === "story" ? (
                    <div className="mt-3 space-y-2 text-sm text-gray-700">
                      {piece.story_teaser && <p>{piece.story_teaser}</p>}
                      {piece.story_cta && (
                        <p className="text-gray-500">Sticker idea: {piece.story_cta}</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {igCaption && (
                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Instagram caption</p>
                            <CopyButton text={igCaption} label="Copy" />
                          </div>
                          <p className="whitespace-pre-line rounded-lg bg-[#faf8f4] p-3 text-sm text-gray-800">{igCaption}</p>
                        </div>
                      )}
                      {piece.caption_facebook && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Facebook caption
                          </summary>
                          <div className="mt-2 flex justify-end">
                            <CopyButton text={piece.caption_facebook} label="Copy" />
                          </div>
                          <p className="mt-1 whitespace-pre-line rounded-lg bg-[#faf8f4] p-3 text-sm text-gray-800">
                            {piece.caption_facebook}
                          </p>
                        </details>
                      )}
                    </>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {downloadUrl && (
                      <a
                        href={downloadUrl}
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                        style={{ backgroundColor: primary }}
                      >
                        Download {isVideo ? "video" : "image"}
                      </a>
                    )}
                    {fbDownloadUrl && (
                      <a href={fbDownloadUrl} className="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium text-gray-700">
                        Facebook size
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="mt-12 border-t border-black/10 pt-6 text-center text-sm text-gray-500">
          Photos and campaign by{" "}
          <a href="https://www.frameandformstudio.com" className="font-medium underline underline-offset-2">
            Frame &amp; Form Studio
          </a>
        </footer>
      </main>
    </div>
  );
}
