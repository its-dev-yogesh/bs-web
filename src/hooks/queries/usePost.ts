"use client";

import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";

export function usePost(postId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId ?? ""),
    queryFn: () => postService.getById(postId!),
    enabled: Boolean(postId?.trim()),
    staleTime: 30_000,
  });
}
