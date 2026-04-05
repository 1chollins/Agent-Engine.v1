"use client";

import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-sage hover:text-cream"
      >
        Sign out
      </button>
    </form>
  );
}
