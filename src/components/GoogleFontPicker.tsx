"use client";

import { useState, useEffect, useRef, useMemo } from "react";

/* ── Popular Google Fonts (curated) ── */
const POPULAR_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Nunito",
  "Raleway",
  "Oswald",
  "Merriweather",
  "Playfair Display",
  "Source Sans 3",
  "Noto Sans",
  "Ubuntu",
  "Rubik",
  "Work Sans",
  "Noto Serif",
  "Lora",
  "Fira Sans",
  "PT Sans",
  "PT Serif",
  "Barlow",
  "Mulish",
  "Nunito Sans",
  "Quicksand",
  "Heebo",
  "Karla",
  "Cabin",
  "Libre Baskerville",
  "DM Sans",
  "DM Serif Display",
  "Josefin Sans",
  "Archivo",
  "Manrope",
  "Bitter",
  "Crimson Text",
  "Cormorant Garamond",
  "IBM Plex Sans",
  "IBM Plex Serif",
  "Space Grotesk",
  "Outfit",
  "Plus Jakarta Sans",
  "Sora",
  "Lexend",
  "Be Vietnam Pro",
  "Figtree",
  "Instrument Sans",
  "Geist",
  "Bricolage Grotesque",
  "Spectral",
  "Source Serif 4",
  "Libre Franklin",
  "Titillium Web",
  "Exo 2",
  "Signika",
  "Catamaran",
  "Asap",
  "Inconsolata",
  "Overpass",
  "Hind",
  "Abel",
  "Varela Round",
  "Pacifico",
  "Caveat",
  "Dancing Script",
  "Satisfy",
  "Great Vibes",
  "Sacramento",
  "Comfortaa",
  "Baloo 2",
  "Righteous",
  "Fredoka",
  "Permanent Marker",
];

/* ── Load a single Google Font ── */
const loadedFonts = new Set<string>();

function loadGoogleFont(fontName: string) {
  if (!fontName || loadedFonts.has(fontName)) return;
  loadedFonts.add(fontName);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
}

/* ── Component ── */

interface GoogleFontPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function GoogleFontPicker({
  label,
  value,
  onChange,
  placeholder = "Select a font...",
}: GoogleFontPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load current font for preview
  useEffect(() => {
    if (value) loadGoogleFont(value);
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Filter fonts
  const filtered = useMemo(() => {
    if (!search.trim()) return POPULAR_FONTS;
    const q = search.toLowerCase();
    return POPULAR_FONTS.filter((f) => f.toLowerCase().includes(q));
  }, [search]);

  const handleSelect = (font: string) => {
    loadGoogleFont(font);
    onChange(font);
    setSearch("");
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {/* Selected value display / trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] text-left"
      >
        {value ? (
          <span style={{ fontFamily: `'${value}', sans-serif` }} className="truncate">
            {value}
          </span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-gray-600 p-0.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fonts..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Font list */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">No fonts found</div>
            ) : (
              filtered.map((font) => {
                const isSelected = font === value;
                return (
                  <button
                    key={font}
                    type="button"
                    onMouseEnter={() => loadGoogleFont(font)}
                    onClick={() => handleSelect(font)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span style={{ fontFamily: `'${font}', sans-serif` }}>{font}</span>
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Live preview */}
      {value && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Preview</p>
          <p
            className="text-base text-gray-800"
            style={{ fontFamily: `'${value}', sans-serif` }}
          >
            The quick brown fox jumps over the lazy dog
          </p>
          <p
            className="text-sm text-gray-600 mt-1 font-bold"
            style={{ fontFamily: `'${value}', sans-serif` }}
          >
            ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
          </p>
        </div>
      )}
    </div>
  );
}
