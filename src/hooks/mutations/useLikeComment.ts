"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";
import type { Comment } from "@/types";

export function useLikeComment(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      liked ? postService.unlikeComment(id) : postService.likeComment(id),
    onMutate: async ({ id, liked }) => {
      await qc.cancelQueries({ queryKey: queryKeys.posts.comments(postId) });
      const prev = qc.getQueryData<Comment[]>(
        queryKeys.posts.comments(postId),
      );
      if (prev) {
        qc.setQueryData<Comment[]>(
          queryKeys.posts.comments(postId),
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  liked: !liked,
                  likeCount: c.likeCount + (liked ? -1 : 1),
                }
              : c,
          ),
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev)
        qc.setQueryData(queryKeys.posts.comments(postId), ctx.prev);
    },
  });
}
