"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import useAuthFetch from "./useAuthFetch";

const PAGE_SIZE = 10;

interface UseApiOptions {
  /** items per page (default 10) */
  limit?: number;
  /** auto-fetch on mount (default true) */
  autoFetch?: boolean;
}

interface UseApiReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  setPage: (p: number) => void;
  refetch: () => void;
}

/**
 * Hook for paginated GET requests through the authenticated API.
 * Path is relative to the admin church endpoint, e.g. "/events", "/sermons".
 * Internally prepends: API_URL/api/admin/{churchSlug}
 */
export default function useApi<T>(path: string, options: UseApiOptions = {}): UseApiReturn<T> {
  const { limit = PAGE_SIZE, autoFetch = true } = options;
  const { adminFetch } = useAuthFetch();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchData = useCallback(async () => {
    if (!path) {
      setLoading(false);
      return;
    }

    // abort previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const separator = path.includes("?") ? "&" : "?";
      const paginatedPath = `${path}${separator}limit=${limit}&offset=${(page - 1) * limit}&locale=pt`;

      const res = await adminFetch(paginatedPath, { signal: controller.signal });
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const json = await res.json();

      if (Array.isArray(json)) {
        // API returned flat array — no pagination metadata
        setData(json);
        setTotal(json.length);
      } else if (json && Array.isArray(json.data)) {
        // API returned { data, total }
        setData(json.data);
        setTotal(json.total ?? json.data.length);
      } else {
        // single object → wrap
        setData(json ? [json] : []);
        setTotal(json ? 1 : 0);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Unknown error");
      setData([]);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [path, page, limit, adminFetch]);

  useEffect(() => {
    if (autoFetch) fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData, autoFetch]);

  return { data, loading, error, page, totalPages, total, setPage, refetch: fetchData };
}
