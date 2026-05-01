"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { queryKeys } from "@/lib/query-keys";
import { useAppStore } from "@/store/main.store";
import { ApiError } from "@/lib/api-error";
import { storage, STORAGE_KEYS } from "@/lib/storage";

export function useCurrentUser() {
  const setUser = useAppStore((s) => s.setUser);
  const setHydrated = useAppStore((s) => s.setHydrated);

  // Logged-out users have no access token → the query below stays disabled
  // and would never flip isHydrated. Mark hydrated on mount in that case so
  // route guards (e.g. /profile) don't spin forever.
  useEffect(() => {
    if (!storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN)) {
      setUser(null);
      setHydrated(true);
    }
  }, [setUser, setHydrated]);

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      try {
        const fresh = await authService.me();
        // /me on the chanakya-astra backend may omit fields that login
        // returned (e.g. `name`). Merge over the persisted user so we keep
        // those fields instead of overwriting them with `undefined`.
        const existing = useAppStore.getState().user;
        const merged = existing ? { ...existing, ...fresh } : fresh;
        setUser(merged);
        setHydrated(true);
        return merged;
      } catch (err) {
        if (err instanceof ApiError && err.isUnauthorized) {
          setUser(null);
          setHydrated(true);
          return null;
        }
        throw err;
      }
    },
    staleTime: 60 * 1000,
    enabled: Boolean(storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN)),
  });
}
