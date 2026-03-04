"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/auth";

export function useDashboardData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiFetch(endpoint);
        if (!res.ok) {
          setError("Failed to load data");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}
