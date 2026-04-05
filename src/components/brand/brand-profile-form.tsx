"use client";

import { useFormState } from "react-dom";
import { useCallback, useState } from "react";
import { createBrandProfile, updateBrandProfile } from "@/lib/actions/brand-profile";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ImageUpload } from "@/components/brand/image-upload";
import { ColorPicker } from "@/components/brand/color-picker";
import { ColorPreview } from "@/components/brand/color-preview";
import type { BrandProfile } from "@/types/brand-profile";
import { BRAND_TONES } from "@/types/brand-profile";

type BrandProfileFormProps = {
  mode: "create" | "edit";
  userId: string;
  initialData?: BrandProfile | null;
};

export function BrandProfileForm({ mode, userId, initialData }: BrandProfileFormProps) {
  const action = mode === "create" ? createBrandProfile : updateBrandProfile;
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

  const handleHeadshotUploaded = useCallback((path: string) => setHeadshotPath(path), []);
  const handleLogoUploaded = useCallback((path: string) => setLogoPath(path), []);

  return (
    <form action={formAction} className="space-y-8">
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

      {/* Agent Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Agent Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Agent Name *"
            name="agent_name"
            required
            autoComplete="name"
            defaultValue={initialData?.agent_name}
            onChange={(e) => setAgentName(e.target.value)}
          />
          <FormField label="Title *" name="agent_title" placeholder="e.g. Realtor" required defaultValue={initialData?.agent_title} />
          <FormField label="Brokerage Name *" name="brokerage_name" required defaultValue={initialData?.brokerage_name} />
          <FormField label="Phone *" name="phone" type="tel" required autoComplete="tel" defaultValue={initialData?.phone} />
          <FormField label="Contact Email *" name="email" type="email" required autoComplete="email" defaultValue={initialData?.email} />
          <FormField label="Website" name="website" placeholder="https://" defaultValue={initialData?.website ?? ""} />
          <FormField label="Instagram Handle" name="instagram_handle" placeholder="@yourhandle" defaultValue={initialData?.instagram_handle ?? ""} />
          <FormField label="Facebook URL" name="facebook_url" placeholder="https://facebook.com/..." defaultValue={initialData?.facebook_url ?? ""} />
        </div>
      </section>

      {/* Tone */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Brand Voice</h2>
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
            Tone *
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
        <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <ImageUpload
            label="Headshot *"
            name="headshot"
            bucket="brand-assets"
            storagePath={`${userId}/headshot`}
            accept="image/jpeg,image/png"
            currentPath={initialData?.headshot_path}
            onUploaded={handleHeadshotUploaded}
          />
          <ImageUpload
            label="Logo *"
            name="logo"
            bucket="brand-assets"
            storagePath={`${userId}/logo`}
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
              label="Primary Color *"
              name="primary_color"
              value={primaryColor}
              required
              onChange={setPrimaryColor}
            />
            <ColorPicker
              label="Secondary Color *"
              name="secondary_color"
              value={secondaryColor}
              required
              onChange={setSecondaryColor}
            />
            <ColorPicker
              label="Accent Color"
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
        {mode === "create" ? "Save & Continue" : "Update Profile"}
      </SubmitButton>
    </form>
  );
}

function formatFieldName(field: string): string {
  return field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
