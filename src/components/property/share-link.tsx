"use client";

import { useState } from "react";

/** Copy-to-clipboard for the public property page URL. */
export function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="max-w-full truncate rounded-lg border border-forest/15 bg-white/70 px-3 py-2 text-xs text-ink/80">
        {url}
      </code>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          });
        }}
        className="rounded-lg bg-forest px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-forest/90"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-forest/25 px-4 py-2 text-xs font-medium text-forest transition-colors hover:bg-forest/5"
      >
        Open →
      </a>
    </div>
  );
}
