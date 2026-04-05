"use client";

type ColorPickerProps = {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
};

export function ColorPicker({
  label,
  name,
  value,
  required,
  onChange,
}: ColorPickerProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {!required && <span className="ml-1 text-gray-400">(optional)</span>}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          id={`${name}-picker`}
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded border border-sage"
        />
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          pattern="^#[0-9A-Fa-f]{6}$"
          required={required}
          className="block w-32 rounded-lg border border-sage bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-sage-darker focus:outline-none focus:ring-1 focus:ring-sage-darker"
        />
      </div>
    </div>
  );
}
