"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { resetPassword } from "@/lib/actions/auth";
import { AuthCard } from "@/components/ui/auth-card";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";

export function ResetPasswordForm() {
  const [state, formAction] = useFormState(resetPassword, {
    error: null,
    success: null,
  });

  return (
    <AuthCard
      title="Reset your password"
      footer={
        <Link href="/login" className="font-medium text-black underline hover:text-sage-darker">
          Back to sign in
        </Link>
      }
    >
      {state.success ? (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          {state.success}
        </p>
      ) : (
        <form action={formAction} className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          {state.error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </p>
          )}
          <SubmitButton pendingText="Sending reset link...">
            Send reset link
          </SubmitButton>
        </form>
      )}
    </AuthCard>
  );
}
