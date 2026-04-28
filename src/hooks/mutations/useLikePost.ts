"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";
import type { Paginated, Post } from "@/types";

type FeedPages = { pages: Paginated<Post>[]; pageParams: unknown[] };

export function useLikePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.like(postId),
    onMutate: async (postId) => {
      await qc.cancelQueries({ queryKey: queryKeys.feed.all });
      const prev = qc.getQueryData<FeedPages>(queryKeys.feed.list());
      if (prev) {
        qc.setQueryData<FeedPages>(queryKeys.feed.list(), {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            items: page.items.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    liked: !p.liked,
                    likeCount: p.likeCount + (p.liked ? -1 : 1),
                  }
                : p,
            ),
          })),
        });
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.feed.list(), ctx.prev);
    },
  });
}
