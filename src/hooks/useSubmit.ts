"use client";

import { useState, useCallback, useRef } from "react";
import useAuthFetch from "./useAuthFetch";

interface SubmitOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

interface UseSubmitReturn {
  submit: (path: string, options?: SubmitOptions) => Promise<Response | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for mutations (POST / PUT / DELETE) with built-in duplicate-request guard.
 * Path is relative to the admin church endpoint, e.g. "/events", "/events/{id}".
 * Internally prepends: API_URL/api/admin/{churchSlug}
 */
export default function useSubmit(): UseSubmitReturn {
  const { adminFetch } = useAuthFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lockRef = useRef(false);

  const submit = useCallback(
    async (path: string, options: SubmitOptions = {}): Promise<Response | null> => {
      if (lockRef.current) return null; // prevent double-submit
      lockRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const { method = "POST", body, headers = {} } = options;

        const fetchOptions: RequestInit = { method, headers: { ...headers } };

        if (body !== undefined && body !== null) {
          if (body instanceof FormData) {
            fetchOptions.body = body;
          } else {
            fetchOptions.body = JSON.stringify(body);
          }
        }

        const res = await adminFetch(path, fetchOptions);

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Error ${res.status}`);
        }

        return res;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        return null;
      } finally {
        lockRef.current = false;
        setLoading(false);
      }
    },
    [adminFetch]
  );

  return { submit, loading, error };
}
