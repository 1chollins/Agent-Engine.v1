import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrandProfileForm } from "@/components/brand/brand-profile-form";

export default async function OnboardingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  // If profile is already complete, go to dashboard
  if (profile?.is_complete) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Complete Your Brand Profile
        </h1>
        <p className="mt-3 text-gray-600">
          Set up your brand identity to start generating content for your listings.
        </p>
      </div>
      <BrandProfileForm mode="create" userId={user.id} initialData={profile} />
    </div>
  );
}
