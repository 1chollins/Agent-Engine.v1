"use client";

import { useState, useTransition } from "react";
import { deleteAgentProfile } from "@/lib/actions/brand-profile";

export function DeleteAgentButton({ profileId }: { profileId: string }) {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      {!armed ? (
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Delete this client
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Delete this client profile?</span>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await deleteAgentProfile(profileId);
                if (res?.error) setError(res.error);
              })
            }
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? "Deleting..." : "Yes, delete"}
          </button>
          <button
            type="button"
            onClick={() => setArmed(false)}
            className="text-sm text-gray-500 hover:text-black"
          >
            Cancel
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
