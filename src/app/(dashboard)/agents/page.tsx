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

  const paths = typed.map((p) => p.headshot_path).filter(Boolean);
  const headshots = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage.from("brand-assets").createSignedUrls(paths, 3600);
    for (const s of signed ?? []) if (s.path && s.signedUrl) headshots.set(s.path, s.signedUrl);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Agents</h1>
          <p className="mt-1 max-w-xl text-gray-600">
            Each client agent&apos;s headshot, logo, colors and brokerage. Pick the agent when you
            start a campaign and every post, reel and story carries their branding.
          </p>
        </div>
        <Link
          href="/agents/new"
          className="shrink-0 rounded-lg bg-forest px-5 py-2.5 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-forest/90"
        >
          Add Agent
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {agents.length === 0 && (
          <div className="rounded-xl border border-dashed border-forest/25 bg-white/50 p-8 text-center">
            <p className="font-medium text-gray-500">No client agents yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Add one per agent you shoot for. Their repeat listings reuse it.
            </p>
          </div>
        )}

        {agents.map((a) => (
          <AgentRow
            key={a.id}
            profile={a}
            href={`/agents/${a.id}`}
            headshot={headshots.get(a.headshot_path)}
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
              headshot={headshots.get(account.headshot_path)}
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
      className="flex items-center gap-4 rounded-xl border border-forest/15 bg-white/60 p-3 pr-6 transition-all hover:border-forest/40 hover:shadow-sm"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100">
        {headshot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={headshot} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-black">{profile.agent_name}</p>
        <p className="mt-0.5 truncate text-sm text-gray-500">
          {[profile.agent_title, profile.brokerage_name].filter(Boolean).join(" · ")}
        </p>
        {note && <p className="mt-0.5 text-xs text-gray-400">{note}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: profile.primary_color }} />
        <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: profile.secondary_color }} />
      </div>
      <span className="w-24 shrink-0 text-right text-xs text-gray-500">
        {campaigns} campaign{campaigns === 1 ? "" : "s"}
      </span>
    </Link>
  );
}
