"use client";

import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-md px-3 py-2 text-sm font-medium text-black/70 transition-colors hover:bg-sage-dark hover:text-black"
      >
        Sign out
      </button>
    </form>
  );
}
