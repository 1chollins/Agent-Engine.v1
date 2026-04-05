"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "@/types/auth";

export async function register(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters", success: null };
  }

  const supabase = createClient();
  const origin = headers().get("origin") ?? "";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });

  if (error) {
    return { error: error.message, success: null };
  }

  // Supabase returns a user with empty identities for duplicate emails
  if (data.user && data.user.identities?.length === 0) {
    return { error: "An account with this email already exists", success: null };
  }

  redirect("/onboarding");
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid email or password", success: null };
  }

  const redirectPath = await getPostLoginRedirect(supabase, data.user.id);
  redirect(redirectPath);
}

async function getPostLoginRedirect(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string> {
  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("business_name")
    .eq("user_id", userId)
    .maybeSingle();

  return profile?.business_name ? "/dashboard" : "/onboarding";
}

export async function logout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email") as string;
  const supabase = createClient();
  const origin = headers().get("origin") ?? "";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/update-password`,
  });

  // Never reveal whether the email exists
  return {
    error: null,
    success: "If an account exists with that email, you will receive a password reset link.",
  };
}

export async function updatePassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = formData.get("password") as string;

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters", success: null };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message, success: null };
  }

  redirect("/login?message=Password+updated+successfully");
}
