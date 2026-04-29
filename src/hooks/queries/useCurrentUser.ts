"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { queryKeys } from "@/lib/query-keys";
import { useAppStore } from "@/store/main.store";
import { ApiError } from "@/lib/api-error";
import { storage, STORAGE_KEYS } from "@/lib/storage";

export function useCurrentUser() {
  const setUser = useAppStore((s) => s.setUser);
  const setHydrated = useAppStore((s) => s.setHydrated);

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      try {
        const user = await authService.me();
        setUser(user);
        setHydrated(true);
        return user;
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
