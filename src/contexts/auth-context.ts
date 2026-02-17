"use client";

import { createContext, useContext } from "react";

export interface Church {
  id?: string;
  name: string;
  slug?: string;
  logo_url?: string;
  role?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
  is_super_admin: boolean;
}

export const ROLE_LEVEL: Record<string, number> = {
  owner: 40,
  admin: 30,
  editor: 20,
  member: 10,
};

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  church: Church | null;

  hasMinRole: (required: string) => boolean;
  getAccessToken: () => Promise<string | undefined>;

  signIn: () => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
