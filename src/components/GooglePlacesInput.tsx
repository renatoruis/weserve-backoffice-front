"use client";

import { useState, useEffect, useRef } from "react";

interface GooglePlacesInputProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: { address: string; lat: number; lng: number }) => void;
}

interface Prediction {
  place_id: string;
  description: string;
}

export default function GooglePlacesInput({
  value,
  onChange,
  onPlaceSelect,
}: GooglePlacesInputProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value.length < 3) {
      setPredictions([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/proxy/admin/google/places/autocomplete?input=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        setPredictions(data.predictions || []);
        setShowDropdown(true);
      } catch {
        setPredictions([]);
      }
    }, 400);

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [value]);

  const handleSelect = async (prediction: Prediction) => {
    onChange(prediction.description);
    setShowDropdown(false);
    setPredictions([]);

    try {
      const res = await fetch(
        `/api/proxy/admin/google/places/details?place_id=${encodeURIComponent(prediction.place_id)}`
      );
      const data = await res.json();
      if (data.result?.geometry?.location) {
        onPlaceSelect({
          address: prediction.description,
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
        });
      }
    } catch {
      // fallback: at least set the address
      onPlaceSelect({ address: prediction.description, lat: 0, lng: 0 });
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => predictions.length > 0 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="Start typing an address..."
        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 focus:border-[var(--color-primary)]"
      />
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {predictions.map((p) => (
            <button
              key={p.place_id}
              type="button"
              onClick={() => handleSelect(p)}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
            >
              {p.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
