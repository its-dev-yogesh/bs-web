"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";
import type { Post } from "@/types";

type FeedPages = { pages: Post[][]; pageParams: unknown[] };

export function useSavePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
      saved ? postService.unsave(id) : postService.save(id),
    onMutate: async ({ id, saved }) => {
      await qc.cancelQueries({ queryKey: queryKeys.feed.all });
      const prev = qc.getQueryData<FeedPages>(queryKeys.feed.list());

      if (prev) {
        qc.setQueryData<FeedPages>(queryKeys.feed.list(), {
          ...prev,
          pages: prev.pages.map((page) =>
            page.map((post) =>
              post.id === id ? { ...post, saved: !saved } : post
            )
          ),
        });
      }
      return { prev };
    },
    onError: (err, _variables, context) => {
      if (context?.prev) {
        qc.setQueryData(queryKeys.feed.list(), context.prev);
      }
      uiActions.error("Action failed", err.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.feed.all });
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
