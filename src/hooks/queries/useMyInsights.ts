"use client";

import { useQuery } from "@tanstack/react-query";
import { meService } from "@/services/me.service";
import { queryKeys } from "@/lib/query-keys";

export function useMyInsights(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me.insights(),
    queryFn: () => meService.getInsights(),
    enabled,
    staleTime: 30_000,
  });
}
