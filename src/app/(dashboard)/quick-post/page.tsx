import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostComposer, type InitialBrand } from "@/components/studio/post-composer";
import type { BrandProfile } from "@/types/brand-profile";

export const metadata = {
  title: "Quick Post — Listing Studio",
};

/** Download a brand asset and inline it as a data URL (small images only). */
async function assetToDataUrl(
  supabase: ReturnType<typeof createClient>,
  path: string | null
): Promise<string | null> {
  if (!path) return null;
  try {
    const { data, error } = await supabase.storage.from("brand-assets").download(path);
    if (error || !data) return null;
    const buffer = Buffer.from(await data.arrayBuffer());
    if (buffer.length > 2_000_000) return null; // keep page payload sane
    const ext = path.split(".").pop()?.toLowerCase() ?? "jpeg";
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function QuickPostPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // One brand profile powers every tool: enter it in Settings, Quick Post wears it.
  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let initialBrand: InitialBrand | undefined;
  if (profile) {
    const p = profile as BrandProfile;
    const [headshotUrl, logoUrl] = await Promise.all([
      assetToDataUrl(supabase, p.headshot_path),
      assetToDataUrl(supabase, p.logo_path),
    ]);
    initialBrand = {
      agentName: p.agent_name,
      agentTitle: [p.agent_title, p.brokerage_name].filter(Boolean).join(" · "),
      phone: p.phone,
      email: p.email,
      website: p.website ?? undefined,
      socialHandle: p.instagram_handle ?? undefined,
      headshotUrl,
      logoUrl,
    };
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-tan">
          Quick Post
        </p>
        <h1 className="mt-1 text-2xl font-bold text-black sm:text-3xl">
          A finished post in one click.
        </h1>
        <p className="mt-1 text-gray-600">
          Drop a photo — the AI writes it, your brand styles it, you download it.
        </p>
      </div>
      <PostComposer initialBrand={initialBrand} />
    </div>
  );
}
