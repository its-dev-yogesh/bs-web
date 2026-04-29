"use client";

import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";

export function useProfilePosts(profileUserId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.posts.all, "profile", profileUserId ?? ""] as const,
    queryFn: () =>
      postService.list({
        user_id: profileUserId!,
        limit: 50,
        skip: 0,
        status: "active",
      }),
    enabled: Boolean(profileUserId?.trim()),
    staleTime: 20_000,
  });
}
