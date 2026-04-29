"use client";

import { useQuery } from "@tanstack/react-query";
import { connectionService } from "@/services/connection.service";
import { queryKeys } from "@/lib/query-keys";

export function useSuggestedUsers(limit = 10) {
  return useQuery({
    queryKey: queryKeys.connections.suggestions(),
    queryFn: () => connectionService.suggestions(),
    select: (users) => users.slice(0, limit),
    staleTime: 0,
  });
}
