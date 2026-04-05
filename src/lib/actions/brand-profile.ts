"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BrandProfileFormState, BrandTone } from "@/types/brand-profile";

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

  const { error } = await supabase.from("brand_profiles").upsert(
    { ...fields, user_id: user.id, is_complete: true },
    { onConflict: "user_id" }
  );

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
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message, success: null };
  }

  return { error: null, success: "Brand profile updated successfully" };
}

function extractFields(formData: FormData) {
  return {
    agent_name: formData.get("agent_name") as string,
    agent_title: formData.get("agent_title") as string,
    brokerage_name: formData.get("brokerage_name") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    website: (formData.get("website") as string) || null,
    instagram_handle: (formData.get("instagram_handle") as string) || null,
    facebook_url: (formData.get("facebook_url") as string) || null,
    headshot_path: formData.get("headshot_path") as string,
    logo_path: formData.get("logo_path") as string,
    primary_color: formData.get("primary_color") as string,
    secondary_color: formData.get("secondary_color") as string,
    accent_color: (formData.get("accent_color") as string) || null,
    tone: formData.get("tone") as string,
  };
}

function validateRequired(fields: Record<string, string | null>): string[] {
  return REQUIRED_FIELDS.filter((key) => !fields[key]);
}
