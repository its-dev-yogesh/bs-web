"use client";

import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";

export function useComments(postId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.comments(postId),
    queryFn: () => postService.listComments(postId),
    enabled: enabled && Boolean(postId),
  });
}
