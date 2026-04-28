"use client";

import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { queryKeys } from "@/lib/query-keys";

export function useProfile(username: string) {
  return useQuery({
    queryKey: queryKeys.profile.byUsername(username),
    queryFn: () => userService.getByUsername(username),
    enabled: Boolean(username),
  });
}
