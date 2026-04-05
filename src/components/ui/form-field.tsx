"use client";

type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required,
  minLength,
  autoComplete,
  defaultValue,
  onChange,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        onChange={onChange}
        className="block w-full rounded-lg border border-sage bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-sage-darker focus:outline-none focus:ring-1 focus:ring-sage-darker"
      />
    </div>
  );
}
