import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BrandProfileForm } from "@/components/brand/brand-profile-form";
import { DeleteAgentButton } from "@/components/brand/delete-agent-button";
import type { BrandProfile } from "@/types/brand-profile";

export const dynamic = "force-dynamic";

export default async function EditAgentPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) notFound();
  if ((profile as BrandProfile).is_primary) redirect("/settings/brand");

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/agents" className="text-sm text-gray-500 hover:text-black">
        ← Agents
      </Link>
      <div className="mb-8 mt-3">
        <h1 className="text-3xl font-bold text-gray-900">{(profile as BrandProfile).agent_name}</h1>
        <p className="mt-3 text-gray-600">
          Changes apply to campaigns generated from now on. Finished campaigns keep the branding
          they were made with.
        </p>
      </div>
      <BrandProfileForm
        mode="edit"
        variant="agent"
        userId={user.id}
        profileId={params.id}
        initialData={profile as BrandProfile}
      />
      <div className="mt-12 border-t border-gray-200 pt-6">
        <DeleteAgentButton profileId={params.id} />
      </div>
    </div>
  );
}
