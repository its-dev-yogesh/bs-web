"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";
import type { Post } from "@/types";

type FeedPages = { pages: Post[][]; pageParams: unknown[] };

function applySave(p: Post, saved: boolean): Post {
  return {
    ...p,
    saved: !saved,
    saveCount: (p.saveCount ?? 0) + (saved ? -1 : 1),
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
      const prevFeed = qc.getQueryData<FeedPages>(queryKeys.feed.list());

      if (prevFeed) {
        qc.setQueryData<FeedPages>(queryKeys.feed.list(), {
          ...prevFeed,
          pages: prevFeed.pages.map((page) =>
            page.map((post) =>
              post.id === id ? applySave(post, saved) : post,
            ),
          ),
        });
      }
      const prevPostLists = qc.getQueriesData<Post[]>({
        queryKey: queryKeys.posts.all,
      });
      qc.setQueriesData<Post[]>({ queryKey: queryKeys.posts.all }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((p) => (p.id === id ? applySave(p, saved) : p));
      });
      return { prevFeed, prevPostLists };
    },
    onError: (err, _variables, context) => {
      if (context?.prevFeed) {
        qc.setQueryData(queryKeys.feed.list(), context.prevFeed);
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
