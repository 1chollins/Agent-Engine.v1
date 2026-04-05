import { createClient } from "@/lib/supabase/server";

const REQUIRED_FIELDS = [
  "agent_name",
  "agent_title",
  "brokerage_name",
  "phone",
  "email",
  "headshot_path",
  "logo_path",
  "primary_color",
  "secondary_color",
  "tone",
] as const;

type CheckResult =
  | { complete: true }
  | { complete: false; missingFields: string[] };

export async function checkBrandProfileComplete(userId: string): Promise<CheckResult> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) {
    return { complete: false, missingFields: [...REQUIRED_FIELDS] };
  }

  if (profile.is_complete) {
    return { complete: true };
  }

  const missing = REQUIRED_FIELDS.filter(
    (field) => !profile[field as keyof typeof profile]
  );

  return missing.length === 0
    ? { complete: true }
    : { complete: false, missingFields: missing };
}
