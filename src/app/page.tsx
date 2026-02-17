"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const router = useRouter();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (isLoading || redirectedRef.current) return;

    if (isAuthenticated) {
      redirectedRef.current = true;
      router.replace("/dashboard");
    } else {
      redirectedRef.current = true;
      signIn();
    }
  }, [isAuthenticated, isLoading, router, signIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400 mt-4">Redirecionando...</p>
      </div>
    </div>
  );
}
