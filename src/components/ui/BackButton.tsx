"use client";

import { ArrowLeftIcon } from "@/components/icons";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export default function BackButton({ onClick, label = "Voltar" }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
    >
      <ArrowLeftIcon size={16} />
      {label}
    </button>
  );
}
