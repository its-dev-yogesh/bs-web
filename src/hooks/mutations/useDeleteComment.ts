"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";
import type { Comment, Post } from "@/types";

type FeedPages = { pages: Post[][]; pageParams: unknown[] };

export function useDeleteComment(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => postService.deleteComment(commentId),
    onMutate: async (commentId) => {
      await qc.cancelQueries({ queryKey: queryKeys.posts.comments(postId) });
      const prevComments = qc.getQueryData<Comment[]>(
        queryKeys.posts.comments(postId),
      );
      const prevFeed = qc.getQueryData<FeedPages>(queryKeys.feed.list());

      const target = prevComments?.find((c) => c.id === commentId);
      const removedIds = new Set<string>([commentId]);
      // Also remove direct replies to the deleted comment from the local cache
      // so they don't appear orphaned. Backend cascade is not assumed.
      if (prevComments) {
        for (const c of prevComments) {
          if (c.parentId === commentId) removedIds.add(c.id);
        }
        qc.setQueryData<Comment[]>(
          queryKeys.posts.comments(postId),
          prevComments.filter((c) => !removedIds.has(c.id)),
        );
      }

      if (prevFeed) {
        const removedCount = removedIds.size;
        qc.setQueryData<FeedPages>(queryKeys.feed.list(), {
          ...prevFeed,
          pages: prevFeed.pages.map((page) =>
            page.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    commentCount: Math.max(0, p.commentCount - removedCount),
                  }
                : p,
            ),
          ),
        });
      }

      return { prevComments, prevFeed, target };
    },
    onError: (_err, _commentId, ctx) => {
      if (ctx?.prevComments)
        qc.setQueryData(queryKeys.posts.comments(postId), ctx.prevComments);
      if (ctx?.prevFeed) qc.setQueryData(queryKeys.feed.list(), ctx.prevFeed);
    },
  });
}
