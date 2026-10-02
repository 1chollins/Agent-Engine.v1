"use client";

import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
      >
        Sign out
      </button>
    </form>
  );
}
