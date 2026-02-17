"use client";

import { useState, lazy, Suspense } from "react";

const RichTextEditor = lazy(() => import("./RichTextEditor"));

interface I18nValue {
  en: string;
  pt: string;
}

interface I18nFieldProps {
  label: string;
  value: I18nValue;
  onChange: (value: I18nValue) => void;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  richText?: boolean;
}

const tabs: { key: keyof I18nValue; label: string }[] = [
  { key: "pt", label: "PT" },
  { key: "en", label: "EN" },
];

export default function I18nField({
  label,
  value,
  onChange,
  rows,
  required,
  placeholder,
  richText,
}: I18nFieldProps) {
  const [active, setActive] = useState<keyof I18nValue>("pt");

  const baseClass =
    "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]";

  const handleChange = (text: string) => {
    onChange({ ...value, [active]: text });
  };

  const otherKey = active === "pt" ? "en" : "pt";
  const otherLabel = active === "pt" ? "EN" : "PT";
  const otherValue = value[otherKey] || "";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                active === tab.key
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {richText ? (
        <Suspense
          fallback={
            <div className="w-full h-[200px] bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-sm text-gray-400">
              Loading editor...
            </div>
          }
        >
          <RichTextEditor
            value={value[active] || ""}
            onChange={handleChange}
            placeholder={placeholder || `${label} (${active.toUpperCase()})`}
          />
        </Suspense>
      ) : rows ? (
        <textarea
          value={value[active] || ""}
          onChange={(e) => handleChange(e.target.value)}
          rows={rows}
          required={required && active === "pt"}
          placeholder={placeholder || `${label} (${active.toUpperCase()})`}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value[active] || ""}
          onChange={(e) => handleChange(e.target.value)}
          required={required && active === "pt"}
          placeholder={placeholder || `${label} (${active.toUpperCase()})`}
          className={baseClass}
        />
      )}

      {otherValue ? (
        <p className="mt-1 text-[11px] text-gray-400">
          {otherLabel}: {richText ? otherValue.replace(/<[^>]*>/g, "").slice(0, 60) : otherValue.slice(0, 60)}
          {(richText ? otherValue.replace(/<[^>]*>/g, "").length : otherValue.length) > 60 ? "..." : ""}
        </p>
      ) : null}
    </div>
  );
}
