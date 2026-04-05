"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingText?: string;
};

export function SubmitButton({ children, pendingText }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-cream shadow-sm hover:bg-sage-darker focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 disabled:opacity-50"
    >
      {pending ? pendingText ?? children : children}
    </button>
  );
}
