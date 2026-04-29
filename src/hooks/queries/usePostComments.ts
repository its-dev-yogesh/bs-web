"use client";

import { useQuery } from "@tanstack/react-query";
import { commentService } from "@/services/comment.service";
import { queryKeys } from "@/lib/query-keys";

export function usePostComments(postId: string, enabled = false) {
  return useQuery({
    queryKey: queryKeys.posts.comments(postId),
    queryFn: () => commentService.list(postId),
    enabled: Boolean(postId) && enabled,
    staleTime: 20_000,
  });
}
