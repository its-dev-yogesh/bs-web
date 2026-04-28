"use client";

import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { queryKeys } from "@/lib/query-keys";

export function useSuggestedUsers(limit = 10) {
  return useQuery({
    queryKey: queryKeys.connections.suggestions(),
    queryFn: () => userService.list(),
    select: (users) => users.slice(0, limit),
    staleTime: 60_000,
  });
}
