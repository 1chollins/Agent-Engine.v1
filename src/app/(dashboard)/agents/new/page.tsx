import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BrandProfileForm } from "@/components/brand/brand-profile-form";

export const dynamic = "force-dynamic";

export default async function NewAgentPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Minted here so the headshot and logo upload into this agent's own folder
  // before the profile row is saved.
  const profileId = randomUUID();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/agents" className="text-sm text-gray-500 hover:text-black">
        ← Agents
      </Link>
      <div className="mb-8 mt-3">
        <h1 className="text-3xl font-bold text-gray-900">Add Agent</h1>
        <p className="mt-3 text-gray-600">
          The agent&apos;s branding for their campaigns: headshot, logo, colors, brokerage and
          contact details. Their content shows this, not your studio profile.
        </p>
      </div>
      <BrandProfileForm mode="create" variant="agent" userId={user.id} profileId={profileId} />
    </div>
  );
}
