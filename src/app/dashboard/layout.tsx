"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import DashboardShell from "./DashboardShell";

function FullScreenSpinner({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto" />
        {message && (
          <p className="text-sm text-gray-400 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, signIn } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      signIn();
    }
  }, [isLoading, isAuthenticated, signIn]);

  // Still loading auth state
  if (isLoading) {
    return <FullScreenSpinner message="Carregando..." />;
  }

  // Not authenticated — signIn() effect will redirect, show spinner meanwhile
  if (!isAuthenticated) {
    return <FullScreenSpinner message="Redirecionando..." />;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
