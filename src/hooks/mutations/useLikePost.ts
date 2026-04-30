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

function applyLike(p: Post, liked: boolean): Post {
  return {
    ...p,
    liked: !liked,
    likeCount: p.likeCount + (liked ? -1 : 1),
  };
}

export function useLikePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      liked ? postService.unlike(id) : postService.like(id),
    onMutate: async ({ id, liked }) => {
      await qc.cancelQueries({ queryKey: queryKeys.feed.all });
      await qc.cancelQueries({ queryKey: queryKeys.posts.all });
      const prevFeed = qc.getQueryData<FeedPages>(queryKeys.feed.list());
      if (prevFeed) {
        qc.setQueryData<FeedPages>(
          queryKeys.feed.list(),
          patchPost(prevFeed, id, (p) => applyLike(p, liked)),
        );
      }
      const prevPostLists = qc.getQueriesData<Post[]>({
        queryKey: queryKeys.posts.all,
      });
      qc.setQueriesData<Post[]>({ queryKey: queryKeys.posts.all }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((p) => (p.id === id ? applyLike(p, liked) : p));
      });
      return { prevFeed, prevPostLists };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevFeed) qc.setQueryData(queryKeys.feed.list(), ctx.prevFeed);
      if (ctx?.prevPostLists) {
        for (const [key, data] of ctx.prevPostLists) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSuccess: (_data, vars) => {
      track("post_interest_toggled", { postId: vars.id, nowLiked: !vars.liked });
      qc.invalidateQueries({ queryKey: queryKeys.feed.all });
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
