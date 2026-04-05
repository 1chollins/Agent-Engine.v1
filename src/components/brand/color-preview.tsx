"use client";

type ColorPreviewProps = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  agentName: string;
};

export function ColorPreview({
  primaryColor,
  secondaryColor,
  accentColor,
  agentName,
}: ColorPreviewProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Color Preview</p>
      <div
        className="overflow-hidden rounded-lg border border-gray-200"
        style={{ backgroundColor: secondaryColor || "#f3f4f6" }}
      >
        <div
          className="px-4 py-3"
          style={{ backgroundColor: primaryColor || "#2563eb" }}
        >
          <p className="text-sm font-semibold text-white">
            {agentName || "Your Name"}
          </p>
        </div>
        <div className="px-4 py-4">
          <p className="text-xs text-gray-600">Just Listed — 4 bed / 3 bath</p>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: accentColor || primaryColor || "#2563eb" }}
          >
            $425,000
          </p>
        </div>
      </div>
    </div>
  );
}
