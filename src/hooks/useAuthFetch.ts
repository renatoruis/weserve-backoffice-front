"use client";

import { useCallback, useRef } from "react";
import { useLogto } from "@logto/react";
import { useAuth } from "@/contexts/auth-context";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const API_RESOURCE = process.env.NEXT_PUBLIC_LOGTO_RESOURCE!;

export default function useAuthFetch() {
  const { signIn } = useAuth();
  const { getAccessToken, getIdTokenClaims } = useLogto();

  // Store latest functions in refs so callbacks have stable identity
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  const getIdTokenClaimsRef = useRef(getIdTokenClaims);
  getIdTokenClaimsRef.current = getIdTokenClaims;

  const signInRef = useRef(signIn);
  signInRef.current = signIn;

  // Cache claims — they don't change during a session
  const claimsRef = useRef<{ email?: string; name?: string }>({});

  /** Fetch with auth token (no church slug — for /api/admin/me/* routes) */
  const authFetch = useCallback(
    async (path: string, options?: RequestInit): Promise<Response> => {
      const token = await getAccessTokenRef.current(API_RESOURCE);
      if (!token) {
        signInRef.current();
        throw new Error("Not authenticated");
      }

      // Cache claims
      if (!claimsRef.current.email) {
        const claims = await getIdTokenClaimsRef.current();
        claimsRef.current = {
          email: claims?.email ?? undefined,
          name: claims?.name ?? undefined,
        };
      }
      const claims = claimsRef.current;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        ...(claims.email && { "X-User-Email": claims.email }),
        ...(claims.name && { "X-User-Name": claims.name }),
        ...(options?.headers as Record<string, string>),
      };

      // Don't set Content-Type for FormData — browser sets the boundary
      if (options?.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
      }

      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });

      if (res.status === 401) {
        signInRef.current();
        throw new Error("Unauthorized");
      }

      return res;
    },
    [] // stable — uses refs internally
  );

  /** Fetch admin API (single-tenant: /api/admin/*, no church slug) */
  const adminFetch = useCallback(
    async (path: string, options?: RequestInit): Promise<Response> => {
      const fullPath = path.startsWith("/") ? path : `/${path}`;
      return authFetch(`/api/admin${fullPath}`, options);
    },
    [authFetch]
  );

  return { authFetch, adminFetch };
}
