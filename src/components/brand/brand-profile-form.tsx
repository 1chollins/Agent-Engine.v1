"use client";

import { useFormState } from "react-dom";
import { useCallback, useState } from "react";
import { createBrandProfile, updateBrandProfile, saveAgentProfile } from "@/lib/actions/brand-profile";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ImageUpload } from "@/components/brand/image-upload";
import { ColorPicker } from "@/components/brand/color-picker";
import { ColorPreview } from "@/components/brand/color-preview";
import type { BrandProfile, ProfileType } from "@/types/brand-profile";
import { BRAND_TONES, PROFILE_TYPES } from "@/types/brand-profile";

type BrandProfileFormProps = {
  mode: "create" | "edit";
  userId: string;
  initialData?: BrandProfile | null;
  /**
   * "account" (default) edits the login's own profile. "agent" edits a client
   * agent's profile; pass profileId (existing id, or a fresh UUID for a new one).
   */
  variant?: "account" | "agent";
  profileId?: string;
};

export function BrandProfileForm({
  mode,
  userId,
  initialData,
  variant = "account",
  profileId,
}: BrandProfileFormProps) {
  const isAgent = variant === "agent";
  const action = isAgent
    ? saveAgentProfile
    : mode === "create"
      ? createBrandProfile
      : updateBrandProfile;
  // Each agent's images live in their own folder so one agent's upload can
  // never overwrite another's (or the account's) headshot.
  const assetPrefix = isAgent ? `${userId}/agents/${profileId}` : userId;
  const [state, formAction] = useFormState(action, {
    error: null,
    success: null,
  });

  const [headshotPath, setHeadshotPath] = useState(initialData?.headshot_path ?? "");
  const [logoPath, setLogoPath] = useState(initialData?.logo_path ?? "");
  const [primaryColor, setPrimaryColor] = useState(initialData?.primary_color ?? "#2563eb");
  const [secondaryColor, setSecondaryColor] = useState(initialData?.secondary_color ?? "#f3f4f6");
  const [accentColor, setAccentColor] = useState(initialData?.accent_color ?? "");
  const [agentName, setAgentName] = useState(initialData?.agent_name ?? "");
  const [profileType, setProfileType] = useState<ProfileType>(initialData?.profile_type ?? "agent");
  const isHost = profileType === "host";

  const handleHeadshotUploaded = useCallback((path: string) => setHeadshotPath(path), []);
  const handleLogoUploaded = useCallback((path: string) => setLogoPath(path), []);

  return (
    <form action={formAction} className="space-y-8">
      {isAgent && <input type="hidden" name="profile_id" value={profileId} />}
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {state.error}
          {state.missingFields && (
            <ul className="mt-1 list-inside list-disc">
              {state.missingFields.map((f) => (
                <li key={f}>{formatFieldName(f)}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {state.success && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          {state.success}
        </p>
      )}

      {/* Who it's for */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          {isAgent ? "This client is a…" : "I market…"}
        </h2>
        <input type="hidden" name="profile_type" value={profileType} />
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Profile type">
          {PROFILE_TYPES.map((t) => {
            const selected = profileType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setProfileType(t.value)}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  selected
                    ? "border-forest bg-forest text-cream shadow-sm"
                    : "border-forest/20 bg-white/60 text-ink hover:border-forest/50"
                }`}
              >
                <span className="block text-sm font-semibold">{t.label}</span>
                <span className={`mt-0.5 block text-xs ${selected ? "text-cream/75" : "text-ink/55"}`}>{t.hint}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Contact — only name, phone and email are required */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {isHost ? "Host information" : "Agent information"}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">Only the fields marked * are required.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={isHost ? "Host name *" : "Agent name *"}
            name="agent_name"
            required
            autoComplete="name"
            defaultValue={initialData?.agent_name}
            onChange={(e) => setAgentName(e.target.value)}
          />
          <FormField label="Phone *" name="phone" type="tel" required autoComplete="tel" defaultValue={initialData?.phone} />
          <FormField label="Contact email *" name="email" type="email" required autoComplete="email" defaultValue={initialData?.email} />
          <FormField
            label="Title"
            name="agent_title"
            placeholder={isHost ? "e.g. Superhost" : "e.g. Realtor"}
            defaultValue={initialData?.agent_title ?? ""}
          />
          <FormField
            key={`brokerage-${profileType}`}
            label={isHost ? "Business or property name" : "Brokerage"}
            name="brokerage_name"
            placeholder={isHost ? "e.g. Gulf Breeze Stays" : "e.g. Top Tier Realty"}
            defaultValue={initialData?.brokerage_name ?? ""}
          />
          {isHost && (
            <FormField
              label="Booking link"
              name="booking_url"
              type="url"
              placeholder="https://airbnb.com/rooms/…"
              defaultValue={initialData?.booking_url ?? ""}
            />
          )}
          <FormField label="Website" name="website" placeholder="https://" defaultValue={initialData?.website ?? ""} />
          <FormField label="Instagram handle" name="instagram_handle" placeholder="@yourhandle" defaultValue={initialData?.instagram_handle ?? ""} />
          <FormField label="Facebook URL" name="facebook_url" placeholder="https://facebook.com/..." defaultValue={initialData?.facebook_url ?? ""} />
        </div>
        {!isHost && initialData?.booking_url ? (
          <input type="hidden" name="booking_url" value={initialData.booking_url} />
        ) : null}
      </section>

      {/* Tone */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Brand Voice</h2>
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
            Tone
          </label>
          <select
            id="tone"
            name="tone"
            defaultValue={initialData?.tone ?? "professional"}
            required
            className="mt-1.5 block w-full rounded-lg border border-sage bg-white px-3 py-2.5 text-sm shadow-sm focus:border-sage-darker focus:outline-none focus:ring-1 focus:ring-sage-darker"
          >
            {BRAND_TONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Photos */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Photos (optional)</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Without them, posts and reels use the name and brand colors instead.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <ImageUpload
            label={isHost ? "Photo of you" : "Headshot"}
            name="headshot"
            bucket="brand-assets"
            storagePath={`${assetPrefix}/headshot`}
            accept="image/jpeg,image/png"
            currentPath={initialData?.headshot_path}
            onUploaded={handleHeadshotUploaded}
          />
          <ImageUpload
            label="Logo"
            name="logo"
            bucket="brand-assets"
            storagePath={`${assetPrefix}/logo`}
            accept="image/jpeg,image/png,image/svg+xml"
            currentPath={initialData?.logo_path}
            onUploaded={handleLogoUploaded}
          />
        </div>
        <input type="hidden" name="headshot_path" value={headshotPath} />
        <input type="hidden" name="logo_path" value={logoPath} />
      </section>

      {/* Colors */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Brand Colors</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <ColorPicker
              label="Primary color"
              name="primary_color"
              value={primaryColor}
              required
              onChange={setPrimaryColor}
            />
            <ColorPicker
              label="Secondary color"
              name="secondary_color"
              value={secondaryColor}
              required
              onChange={setSecondaryColor}
            />
            <ColorPicker
              label="Accent color"
              name="accent_color"
              value={accentColor}
              onChange={setAccentColor}
            />
          </div>
          <ColorPreview
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
            agentName={agentName}
          />
        </div>
      </section>

      <SubmitButton pendingText={mode === "create" ? "Saving profile..." : "Updating profile..."}>
        {isAgent
          ? mode === "create" ? "Save client" : "Update client"
          : mode === "create" ? "Save & Continue" : "Update Profile"}
      </SubmitButton>
    </form>
  );
}

function formatFieldName(field: string): string {
  return field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
