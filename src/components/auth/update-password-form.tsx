"use client";

import { useFormState } from "react-dom";
import { FormEvent, useRef, useState } from "react";
import { updatePassword } from "@/lib/actions/auth";
import { AuthCard } from "@/components/ui/auth-card";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";

export function UpdatePasswordForm() {
  const [state, formAction] = useFormState(updatePassword, {
    error: null,
    success: null,
  });
  const [mismatch, setMismatch] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const form = formRef.current;
    if (!form) return;

    const password = new FormData(form).get("password") as string;
    const confirm = new FormData(form).get("confirmPassword") as string;

    if (password !== confirm) {
      e.preventDefault();
      setMismatch(true);
    } else {
      setMismatch(false);
    }
  }

  return (
    <AuthCard title="Set new password">
      <form
        ref={formRef}
        action={formAction}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <FormField
          label="New password"
          name="password"
          type="password"
          placeholder="Minimum 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {mismatch && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            Passwords do not match
          </p>
        )}
        {state.error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {state.error}
          </p>
        )}
        <SubmitButton pendingText="Updating password...">
          Update password
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
