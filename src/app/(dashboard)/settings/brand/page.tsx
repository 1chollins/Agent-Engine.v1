import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrandProfileForm } from "@/components/brand/brand-profile-form";

export default async function EditBrandProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // If no profile exists, redirect to onboarding
  if (!profile) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Brand Profile</h1>
        <p className="mt-3 text-gray-600">
          Update your brand identity. Changes apply to future content only.
        </p>
      </div>
      <BrandProfileForm mode="edit" userId={user.id} initialData={profile} />
    </div>
  );
}
