"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { register } from "@/lib/actions/auth";
import { AuthCard } from "@/components/ui/auth-card";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";

export function RegisterForm() {
  const [state, formAction] = useFormState(register, {
    error: null,
    success: null,
  });

  return (
    <AuthCard
      title="Create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="Minimum 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {state.error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {state.error}
          </p>
        )}
        <SubmitButton pendingText="Creating account...">
          Create account
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
