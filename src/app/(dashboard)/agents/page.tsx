import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { BrandProfile } from "@/types/brand-profile";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profiles }, { data: listings }] = await Promise.all([
    supabase
      .from("brand_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false })
      .order("agent_name"),
    supabase.from("listings").select("brand_profile_id").eq("user_id", user.id),
  ]);

  const typed = (profiles ?? []) as BrandProfile[];
  const agents = typed.filter((p) => !p.is_primary);
  const account = typed.find((p) => p.is_primary) ?? null;

  const campaigns = new Map<string, number>();
  for (const l of (listings ?? []) as { brand_profile_id: string | null }[]) {
    if (l.brand_profile_id) campaigns.set(l.brand_profile_id, (campaigns.get(l.brand_profile_id) ?? 0) + 1);
  }

  const paths = typed.map((p) => p.headshot_path).filter((p): p is string => Boolean(p));
  const headshots = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage.from("brand-assets").createSignedUrls(paths, 3600);
    for (const s of signed ?? []) if (s.path && s.signedUrl) headshots.set(s.path, s.signedUrl);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-black sm:text-3xl">Clients</h1>
          <p className="mt-1 max-w-xl text-gray-600">
            The realtors and Airbnb hosts you make campaigns for: name, contact, and any photo,
            logo or colors. Pick the client when you start a campaign. Realtor campaigns sell the
            home; host campaigns fill the calendar.
          </p>
        </div>
        <Link
          href="/agents/new"
          className="shrink-0 rounded-lg bg-forest px-5 py-2.5 text-center text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-forest/90"
        >
          Add client
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {agents.length === 0 && (
          <div className="rounded-xl border border-dashed border-forest/25 bg-white/50 p-8 text-center">
            <p className="font-medium text-gray-500">No clients yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Add one per realtor or host you work with. Their repeat campaigns reuse it.
            </p>
          </div>
        )}

        {agents.map((a) => (
          <AgentRow
            key={a.id}
            profile={a}
            href={`/agents/${a.id}`}
            headshot={a.headshot_path ? headshots.get(a.headshot_path) : undefined}
            campaigns={campaigns.get(a.id) ?? 0}
          />
        ))}

        {account && (
          <>
            <p className="pt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Your own profile
            </p>
            <AgentRow
              profile={account}
              href="/settings/brand"
              headshot={account.headshot_path ? headshots.get(account.headshot_path) : undefined}
              campaigns={campaigns.get(account.id) ?? 0}
              note="Used when a campaign has no client agent"
            />
          </>
        )}
      </div>
    </div>
  );
}

function AgentRow({
  profile,
  href,
  headshot,
  campaigns,
  note,
}: {
  profile: BrandProfile;
  href: string;
  headshot?: string;
  campaigns: number;
  note?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-forest/15 bg-white/60 p-3 transition-all hover:border-forest/40 hover:shadow-sm sm:gap-4 sm:pr-6"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100 sm:h-14 sm:w-14">
        {headshot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={headshot} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium text-black">{profile.agent_name}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              profile.profile_type === "host" ? "bg-tan/20 text-ink/80" : "bg-forest/10 text-forest"
            }`}
          >
            {profile.profile_type === "host" ? "Airbnb host" : "Realtor"}
          </span>
        </p>
        <p className="mt-0.5 truncate text-sm text-gray-500">
          {[profile.agent_title, profile.brokerage_name].filter(Boolean).join(" · ")}
        </p>
        {note && <p className="mt-0.5 text-xs text-gray-400">{note}</p>}
        <p className="mt-0.5 text-xs text-gray-500 sm:hidden">
          {campaigns} campaign{campaigns === 1 ? "" : "s"}
        </p>
      </div>
      <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
        <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: profile.primary_color }} />
        <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: profile.secondary_color }} />
      </div>
      <span className="hidden w-24 shrink-0 text-right text-xs text-gray-500 sm:block">
        {campaigns} campaign{campaigns === 1 ? "" : "s"}
      </span>
    </Link>
  );
}
