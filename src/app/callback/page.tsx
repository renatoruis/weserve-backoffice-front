"use client";

import { useHandleSignInCallback } from "@logto/react";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();

  const { isLoading } = useHandleSignInCallback(() => {
    router.replace("/dashboard");
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Autenticando...</p>
        </div>
      </div>
    );
  }

  return null;
}
