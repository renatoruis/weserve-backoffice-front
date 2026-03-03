"use client";

import { LogtoProvider, LogtoConfig, useLogto } from "@logto/react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AuthContext, Church, UserProfile } from "./auth-context";
import { ROLE_LEVEL } from "@/lib/permissions";

const logtoConfig: LogtoConfig = {
  endpoint: process.env.NEXT_PUBLIC_LOGTO_ENDPOINT!,
  appId: process.env.NEXT_PUBLIC_LOGTO_APP_ID!,
  resources: [process.env.NEXT_PUBLIC_LOGTO_RESOURCE!],
  scopes: ["openid", "profile", "email"],
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const API_RESOURCE = process.env.NEXT_PUBLIC_LOGTO_RESOURCE!;

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    isLoading: logtoLoading,
    getAccessToken,
    getIdTokenClaims,
    signIn: logtoSignIn,
    signOut: logtoSignOut,
  } = useLogto();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [church, setChurch] = useState<Church | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  // Once init completes, isLoading must NEVER go back to true
  // (logtoLoading can oscillate during token refresh — that must NOT unmount children)
  const initCompleteRef = useRef(false);

  // ── Store ALL Logto functions in refs so they never trigger re-renders ──
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  const getIdTokenClaimsRef = useRef(getIdTokenClaims);
  getIdTokenClaimsRef.current = getIdTokenClaims;

  const logtoSignInRef = useRef(logtoSignIn);
  logtoSignInRef.current = logtoSignIn;

  const logtoSignOutRef = useRef(logtoSignOut);
  logtoSignOutRef.current = logtoSignOut;

  // Prevent duplicate init calls
  const initRef = useRef(false);
  // Cache claims — they don't change during a session
  const claimsRef = useRef<{ email?: string; name?: string }>({});

  // Helper: getAccessToken with timeout (avoids hanging during callback transition)
  const getTokenWithTimeout = useCallback(async (timeoutMs = 5000): Promise<string> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Token timeout")), timeoutMs);
      getAccessTokenRef.current(API_RESOURCE).then(
        (token) => { clearTimeout(timer); resolve(token as string); },
        (err) => { clearTimeout(timer); reject(err); }
      );
    });
  }, []);

  // Load profile + churches after authentication (with retry)
  const loadAuthData = useCallback(async () => {
    try {
      const token = await getTokenWithTimeout();

      // Cache claims
      if (!claimsRef.current.email) {
        const c = await getIdTokenClaimsRef.current();
        claimsRef.current = {
          email: c?.email ?? undefined,
          name: c?.name ?? undefined,
        };
      }
      const claims = claimsRef.current;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(claims.email && { "X-User-Email": claims.email }),
        ...(claims.name && { "X-User-Name": claims.name }),
      };

      const [profileRes, churchesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/me/profile`, { headers }),
        fetch(`${API_BASE}/api/admin/churches`, { headers }),
      ]);

      if (profileRes.ok) {
        setUser(await profileRes.json());
      }

      if (churchesRes.ok) {
        const data = await churchesRes.json();
        const c = Array.isArray(data) ? data[0] : data;
        if (c?.name) {
          setChurch({
            id: c.id,
            name: c.name,
            slug: c.slug,
            logo_url: c.logo_url,
            role: c.role ?? "admin",
          });
        }
      }

      return true; // success
    } catch (err) {
      console.error("Failed to load auth data:", err);
      return false; // failure
    }
  }, [getTokenWithTimeout]);

  useEffect(() => {
    // Guard: only fetch once, only when authenticated
    if (!isAuthenticated || initRef.current) return;
    initRef.current = true; // ← block BEFORE any async work

    (async () => {
      // Try up to 3 times with increasing delay
      let success = false;
      for (let attempt = 0; attempt < 3 && !success; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 1000 * attempt)); // 1s, 2s delay
        }
        success = await loadAuthData();
      }

      initCompleteRef.current = true;
      setDataLoading(false);
    })();
  }, [isAuthenticated, loadAuthData]);
  //    ↑ isAuthenticated triggers this

  const hasMinRole = useCallback(
    (required: string) => {
      const role = church?.role ?? "admin";
      return (ROLE_LEVEL[role] || 0) >= (ROLE_LEVEL[required] || 999);
    },
    [church]
  );

  // Stable callbacks via refs
  const signIn = useCallback(() => {
    logtoSignInRef.current(`${window.location.origin}/callback`);
  }, []);

  const signOut = useCallback(() => {
    logtoSignOutRef.current(window.location.origin);
  }, []);

  const getToken = useCallback(
    () => getAccessTokenRef.current(API_RESOURCE),
    []
  );

  // Once init is complete, NEVER go back to loading
  // (logtoLoading can oscillate during token refresh — must not unmount children)
  //
  // For unauthenticated users: logtoLoading=false, isAuthenticated=false → isLoading=false (show login)
  // For authenticated users waiting on data: isAuthenticated=true, dataLoading=true → isLoading=true (show spinner)
  // After data loaded: initCompleteRef=true → isLoading=false forever
  const isLoading = initCompleteRef.current
    ? false
    : logtoLoading || (isAuthenticated && dataLoading);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      church,
      hasMinRole,
      getAccessToken: getToken,
      signIn,
      signOut,
    }),
    [
      isAuthenticated,
      isLoading,
      user,
      church,
      hasMinRole,
      getToken,
      signIn,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LogtoProvider config={logtoConfig}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </LogtoProvider>
  );
}
