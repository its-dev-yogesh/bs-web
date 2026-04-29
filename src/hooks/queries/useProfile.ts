"use client";

import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { queryKeys } from "@/lib/query-keys";

export function useProfile(idOrUsername: string) {
  return useQuery({
    queryKey: queryKeys.profile.byUsername(idOrUsername),
    queryFn: () => userService.getProfile(idOrUsername),
    enabled: Boolean(idOrUsername),
  });
}
