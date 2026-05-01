"use client";

import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";

/** Owner-only on the backend — pass `enabled` only when the viewer is the
 *  post author, otherwise the request will 403. */
export function usePostSavesList(postId: string, enabled = false) {
  return useQuery({
    queryKey: queryKeys.posts.saves(postId),
    queryFn: () => postService.listSavers(postId),
    enabled: Boolean(postId) && enabled,
    staleTime: 20_000,
  });
}
