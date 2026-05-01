"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";
import type { Post } from "@/types";

type FeedPages = { pages: Post[][]; pageParams: unknown[] };

function applySave(p: Post, saved: boolean): Post {
  const current = typeof p.saveCount === "number" && Number.isFinite(p.saveCount) ? p.saveCount : 0;
  const next = current + (saved ? -1 : 1);
  return {
    ...p,
    saved: !saved,
    saveCount: Math.max(0, next),
  };
}

export function useSavePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
      saved ? postService.unsave(id) : postService.save(id),
    onMutate: async ({ id, saved }) => {
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
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((post) =>
                post.id === id ? applySave(post, saved) : post,
              ),
            ),
          };
        },
      );
      const prevPostLists = qc.getQueriesData<Post[]>({
        queryKey: queryKeys.posts.all,
      });
      qc.setQueriesData<Post[]>({ queryKey: queryKeys.posts.all }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((p) => (p.id === id ? applySave(p, saved) : p));
      });
      return { prevFeeds, prevPostLists };
    },
    onError: (err, _variables, context) => {
      if (context?.prevFeeds) {
        for (const [key, data] of context.prevFeeds) {
          qc.setQueryData(key, data);
        }
      }
      if (context?.prevPostLists) {
        for (const [key, data] of context.prevPostLists) {
          qc.setQueryData(key, data);
        }
      }
      uiActions.error("Action failed", err.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.feed.all });
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
