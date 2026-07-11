"use client";

import { useState } from "react";

type LeadFormProps = {
  slug: string;
  agentName: string;
  accentColor: string;
};

/** Public contact form on the property page — no login, honeypot-guarded. */
export function LeadForm({ slug, agentName, accentColor }: LeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot — humans never see it
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/property-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, email, phone, message, company }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong — please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <p className="text-2xl">✓</p>
        <p className="mt-2 text-lg font-semibold text-black">Message sent</p>
        <p className="mt-1 text-sm text-gray-600">
          {agentName} will get back to you shortly.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black/40";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={inputClass}
          maxLength={120}
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={inputClass}
          maxLength={200}
        />
      </div>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone (optional)"
        className={inputClass}
        maxLength={40}
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="I'd love to see this property…"
        rows={3}
        className={inputClass}
        maxLength={2000}
      />
      {/* Honeypot — bots fill it, humans never see it */}
      <input
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0 }}
      />
      <button
        type="submit"
        disabled={busy}
        style={{ backgroundColor: accentColor }}
        className="mt-1 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Sending…" : `Contact ${agentName}`}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
