"use client";

import { useQuery } from "@tanstack/react-query";
import { followService } from "@/services/follow.service";
import { queryKeys } from "@/lib/query-keys";

export function useFollowStatus(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.follows.status(userId ?? ""),
    queryFn: () => followService.status(userId as string),
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
  });
}
