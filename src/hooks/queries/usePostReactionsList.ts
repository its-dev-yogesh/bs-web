"use client";

import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";

export function usePostReactionsList(postId: string, enabled = false) {
  return useQuery({
    queryKey: queryKeys.posts.reactions(postId),
    queryFn: () => postService.listReactions(postId),
    enabled: Boolean(postId) && enabled,
    staleTime: 20_000,
  });
}
