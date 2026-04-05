"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { login } from "@/lib/actions/auth";
import { AuthCard } from "@/components/ui/auth-card";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";

type LoginFormProps = {
  message?: string;
};

export function LoginForm({ message }: LoginFormProps) {
  const [state, formAction] = useFormState(login, {
    error: null,
    success: null,
  });

  return (
    <AuthCard
      title="Sign in to Agent Engine"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Create one
          </Link>
        </>
      }
    >
      {message && (
        <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600">
          {message}
        </p>
      )}
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
          required
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link
            href="/reset-password"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Forgot password?
          </Link>
        </div>
        {state.error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {state.error}
          </p>
        )}
        <SubmitButton pendingText="Signing in...">Sign in</SubmitButton>
      </form>
    </AuthCard>
  );
}
