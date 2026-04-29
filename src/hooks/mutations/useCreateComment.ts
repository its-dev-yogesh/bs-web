"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "@/services/comment.service";
import { queryKeys } from "@/lib/query-keys";
import type { Post } from "@/types";
import { uiActions } from "@/store/actions/ui.actions";

type FeedPages = { pages: Post[][]; pageParams: unknown[] };

function bumpComments(pages: FeedPages, postId: string, delta: number) {
  return {
    ...pages,
    pages: pages.pages.map((page) =>
      page.map((p) =>
        p.id === postId ? { ...p, commentCount: Math.max(0, p.commentCount + delta) } : p,
      ),
    ),
  };
}

export function useCreateComment(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { content: string; parentId?: string | null }) =>
      commentService.create(postId, vars.content.trim(), vars.parentId),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.feed.all });
      const prev = qc.getQueryData<FeedPages>(queryKeys.feed.list());
      if (prev) {
        qc.setQueryData<FeedPages>(queryKeys.feed.list(), bumpComments(prev, postId, 1));
      }
      return { prev };
    },
    onError: (err: Error, _c, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.feed.list(), ctx.prev);
      uiActions.error("Couldn't post comment", err.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) });
      qc.invalidateQueries({ queryKey: queryKeys.feed.all });
      uiActions.success("Comment posted");
    },
  });
}
