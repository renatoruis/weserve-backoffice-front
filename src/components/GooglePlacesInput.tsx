"use client";

import { useState, useEffect, useRef } from "react";
import useAuthFetch from "@/hooks/useAuthFetch";

interface GooglePlacesInputProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: { address: string; lat: number; lng: number }) => void;
  label?: string;
}

interface Prediction {
  place_id: string;
  description: string;
}

export default function GooglePlacesInput({
  value,
  onChange,
  onPlaceSelect,
  label = "Address",
}: GooglePlacesInputProps) {
  const { adminFetch } = useAuthFetch();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isTyping || value.length < 3) {
      setPredictions([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await adminFetch(
          `/google/places/autocomplete?input=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        setPredictions(data.predictions || []);
        setShowDropdown(true);
      } catch {
        setPredictions([]);
      }
    }, 400);

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [value, isTyping]);

  const handleSelect = async (prediction: Prediction) => {
    setIsTyping(false);
    onChange(prediction.description);
    setShowDropdown(false);
    setPredictions([]);

    try {
      const res = await adminFetch(
        `/google/places/details?place_id=${encodeURIComponent(prediction.place_id)}`
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
      onPlaceSelect({ address: prediction.description, lat: 0, lng: 0 });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
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
