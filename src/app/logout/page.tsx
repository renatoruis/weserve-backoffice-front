"use client";

import { useEffect, useRef } from "react";
import { useLogto } from "@logto/react";

const STORAGE_KEY = "selected_church_slug";

export default function LogoutPage() {
  const { signOut, isAuthenticated } = useLogto();
  const signOutRef = useRef(signOut);
  signOutRef.current = signOut;
  const didLogout = useRef(false);

  useEffect(() => {
    if (didLogout.current) return;
    didLogout.current = true;

    // Clear all app data
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.clear();

    // Redirect to Logto sign-out (which clears tokens + session)
    if (isAuthenticated) {
      signOutRef.current(window.location.origin);
    } else {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Logging out...</p>
      </div>
    </div>
  );
}
