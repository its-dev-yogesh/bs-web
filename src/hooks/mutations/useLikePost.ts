"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";
import type { Post } from "@/types";
import { track } from "@/lib/telemetry";

type FeedPages = { pages: Post[][]; pageParams: unknown[] };

function patchPost(pages: FeedPages, postId: string, fn: (p: Post) => Post) {
  return {
    ...pages,
    pages: pages.pages.map((page) =>
      page.map((p) => (p.id === postId ? fn(p) : p)),
    ),
  };
}

export function useLikePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      liked ? postService.unlike(id) : postService.like(id),
    onMutate: async ({ id, liked }) => {
      await qc.cancelQueries({ queryKey: queryKeys.feed.all });
      const prev = qc.getQueryData<FeedPages>(queryKeys.feed.list());
      if (prev) {
        qc.setQueryData<FeedPages>(
          queryKeys.feed.list(),
          patchPost(prev, id, (p) => ({
            ...p,
            liked: !liked,
            likeCount: p.likeCount + (liked ? -1 : 1),
          })),
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.feed.list(), ctx.prev);
    },
    onSuccess: (_data, vars) => {
      track("post_interest_toggled", { postId: vars.id, nowLiked: !vars.liked });
      qc.invalidateQueries({ queryKey: queryKeys.feed.all });
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
