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

function AccessDenied({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="text-center max-w-sm w-full px-6">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-7 h-7 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
          Acesso não autorizado
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-8 leading-relaxed">
          A sua conta não tem permissões para aceder a este backoffice.
          Contacte o administrador da sua organização.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onSignOut}
            className="w-full px-5 py-2.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-sm font-medium text-white transition-colors cursor-pointer"
          >
            Sair da conta
          </button>
          <a
            href="/"
            className="w-full px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm font-medium text-[var(--color-text)] transition-colors text-center"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, church, signIn, signOut } = useAuth();

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

  // Authenticated but no church association = no backoffice access
  if (!church) {
    return <AccessDenied onSignOut={signOut} />;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
