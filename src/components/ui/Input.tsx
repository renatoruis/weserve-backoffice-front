"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const baseClass =
  "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]";

/* ── Text / Number / Date input ── */

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  hint?: string;
  error?: string;
  onChange?: (value: string) => void;
}

export function InputField({
  label,
  hint,
  error,
  onChange,
  className = "",
  id,
  ...props
}: InputFieldProps) {
  const fieldId = id || props.name;
  return (
    <div>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={fieldId}
        className={`${baseClass} ${error ? "border-red-300 focus:ring-red-200" : ""} ${className}`}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ── Textarea ── */

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label?: string;
  hint?: string;
  error?: string;
  onChange?: (value: string) => void;
}

export function TextArea({
  label,
  hint,
  error,
  onChange,
  className = "",
  rows = 3,
  id,
  ...props
}: TextAreaProps) {
  const fieldId = id || props.name;
  return (
    <div>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        rows={rows}
        className={`${baseClass} resize-none ${error ? "border-red-300 focus:ring-red-200" : ""} ${className}`}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ── Select ── */

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
}

export function SelectField({
  label,
  hint,
  error,
  options,
  onChange,
  className = "",
  id,
  ...props
}: SelectFieldProps) {
  const fieldId = id || props.name;
  return (
    <div>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={fieldId}
        className={`${baseClass} ${error ? "border-red-300 focus:ring-red-200" : ""} ${className}`}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
