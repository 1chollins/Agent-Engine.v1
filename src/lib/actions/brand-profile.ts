"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BrandProfileFormState, BrandTone } from "@/types/brand-profile";

/** Name, phone and email only — everything else is optional (2026-10). */
const REQUIRED_FIELDS = ["agent_name", "phone", "email"] as const;

const VALID_TONES: BrandTone[] = ["professional", "friendly", "luxury", "casual"];

export async function createBrandProfile(
  _prevState: BrandProfileFormState,
  formData: FormData
): Promise<BrandProfileFormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in", success: null };
  }

  const fields = extractFields(formData);
  const missing = validateRequired(fields);

  if (missing.length > 0) {
    return { error: "Please fill in all required fields", success: null, missingFields: missing };
  }

  if (!VALID_TONES.includes(fields.tone as BrandTone)) {
    return { error: "Invalid tone selection", success: null };
  }

  // The account's own profile is the primary row. A user can also keep client
  // agent profiles, so "upsert on user_id" no longer identifies one row.
  const { data: existing } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("brand_profiles")
        .update({ ...fields, is_complete: true, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
    : await supabase
        .from("brand_profiles")
        .insert({ ...fields, user_id: user.id, is_complete: true, is_primary: true });

  if (error) {
    return { error: error.message, success: null };
  }

  redirect("/dashboard");
}

export async function updateBrandProfile(
  _prevState: BrandProfileFormState,
  formData: FormData
): Promise<BrandProfileFormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in", success: null };
  }

  const fields = extractFields(formData);
  const missing = validateRequired(fields);
  const isComplete = missing.length === 0;

  if (!VALID_TONES.includes(fields.tone as BrandTone)) {
    return { error: "Invalid tone selection", success: null };
  }

  const { error } = await supabase
    .from("brand_profiles")
    .update({ ...fields, is_complete: isComplete, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_primary", true);

  if (error) {
    return { error: error.message, success: null };
  }

  return { error: null, success: "Brand profile updated successfully" };
}

// ---------------------------------------------------------------------------
// Client agent profiles: extra branding rows under one login, picked per listing.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function saveAgentProfile(
  _prevState: BrandProfileFormState,
  formData: FormData
): Promise<BrandProfileFormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in", success: null };

  // The id is minted by the form so headshot/logo uploads can live under it
  // (brand-assets/{user}/agents/{id}/...) before the row exists.
  const profileId = String(formData.get("profile_id") ?? "");
  if (!UUID_RE.test(profileId)) return { error: "Invalid agent profile", success: null };

  const fields = extractFields(formData);
  const missing = validateRequired(fields);
  if (missing.length > 0) {
    return { error: "Please fill in all required fields", success: null, missingFields: missing };
  }
  if (!VALID_TONES.includes(fields.tone as BrandTone)) {
    return { error: "Invalid tone selection", success: null };
  }

  const { data: existing } = await supabase
    .from("brand_profiles")
    .select("id, is_primary")
    .eq("id", profileId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.is_primary) {
    return { error: "Edit your own profile under Settings", success: null };
  }

  const { error } = existing
    ? await supabase
        .from("brand_profiles")
        .update({ ...fields, is_complete: true, updated_at: new Date().toISOString() })
        .eq("id", profileId)
        .eq("user_id", user.id)
    : await supabase.from("brand_profiles").insert({
        ...fields,
        id: profileId,
        user_id: user.id,
        is_primary: false,
        is_complete: true,
      });

  if (error) return { error: error.message, success: null };

  redirect("/agents");
}

export async function deleteAgentProfile(profileId: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in" };

  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("brand_profile_id", profileId);
  if (count && count > 0) {
    return { error: `This client has ${count} campaign${count === 1 ? "" : "s"} and can't be deleted.` };
  }

  const { error } = await supabase
    .from("brand_profiles")
    .delete()
    .eq("id", profileId)
    .eq("user_id", user.id)
    .eq("is_primary", false);
  if (error) return { error: error.message };

  redirect("/agents");
}

const optional = (formData: FormData, key: string): string | null => {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value : null;
};

function extractFields(formData: FormData) {
  return {
    profile_type: formData.get("profile_type") === "host" ? "host" : "agent",
    agent_name: String(formData.get("agent_name") ?? "").trim(),
    agent_title: optional(formData, "agent_title"),
    brokerage_name: optional(formData, "brokerage_name"),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    booking_url: optional(formData, "booking_url"),
    website: optional(formData, "website"),
    instagram_handle: optional(formData, "instagram_handle"),
    facebook_url: optional(formData, "facebook_url"),
    headshot_path: optional(formData, "headshot_path"),
    logo_path: optional(formData, "logo_path"),
    primary_color: optional(formData, "primary_color") ?? "#3d4a2f",
    secondary_color: optional(formData, "secondary_color") ?? "#f2ebd8",
    accent_color: optional(formData, "accent_color"),
    tone: optional(formData, "tone") ?? "professional",
  };
}

function validateRequired(fields: Record<string, string | null>): string[] {
  return REQUIRED_FIELDS.filter((key) => !fields[key]);
}
