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
  const current = typeof p.likeCount === "number" && Number.isFinite(p.likeCount) ? p.likeCount : 0;
  const next = current + (liked ? -1 : 1);
  return {
    ...p,
    liked: !liked,
    likeCount: Math.max(0, next),
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
      // Match every feed query (the key includes filters like excludeUserId)
      // by prefix instead of an exact lookup.
      const prevFeeds = qc.getQueriesData<FeedPages>({
        queryKey: queryKeys.feed.all,
      });
      qc.setQueriesData<FeedPages>(
        { queryKey: queryKeys.feed.all },
        (old) => {
          if (!old || !Array.isArray(old.pages)) return old;
          return patchPost(old, id, (p) => applyLike(p, liked));
        },
      );
      const prevPostLists = qc.getQueriesData<Post[]>({
        queryKey: queryKeys.posts.all,
      });
      qc.setQueriesData<Post[]>({ queryKey: queryKeys.posts.all }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((p) => (p.id === id ? applyLike(p, liked) : p));
      });
      return { prevFeeds, prevPostLists };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevFeeds) {
        for (const [key, data] of ctx.prevFeeds) {
          qc.setQueryData(key, data);
        }
      }
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
