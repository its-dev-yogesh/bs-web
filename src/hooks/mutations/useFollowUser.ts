"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followService } from "@/services/follow.service";
import { queryKeys } from "@/lib/query-keys";
import type { Post } from "@/types";

type FeedPages = { pages: Post[][]; pageParams: unknown[] };

export function useFollowUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      following,
    }: {
      userId: string;
      following: boolean;
    }) =>
      following ? followService.unfollow(userId) : followService.follow(userId),
    onMutate: async ({ userId, following }) => {
      await qc.cancelQueries({ queryKey: queryKeys.feed.all });
      const prev = qc.getQueryData<FeedPages>(queryKeys.feed.list());
      if (prev) {
        qc.setQueryData<FeedPages>(queryKeys.feed.list(), {
          ...prev,
          pages: prev.pages.map((page) =>
            page.map((p) =>
              p.author.id === userId
                ? { ...p, followingAuthor: !following }
                : p,
            ),
          ),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.feed.list(), ctx.prev);
    },
  });
}
