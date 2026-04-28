"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";
import type { CreatePostInput } from "@/schemas/post.schema";
import type { Post } from "@/types";

type FeedPages = { pages: Post[][]; pageParams: unknown[] };

export function useCreatePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => postService.create(input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: queryKeys.feed.all });
      const prev = qc.getQueryData<FeedPages>(queryKeys.feed.list());

      if (prev) {
        const optimistic: Post = {
          id: `optimistic_${Date.now()}`,
          author: { id: "me", username: "you", name: "You" },
          content: input.content,
          mediaUrls: input.mediaUrls ?? [],
          likeCount: 0,
          commentCount: 0,
          liked: false,
          saved: false,
          createdAt: new Date().toISOString(),
        };
        qc.setQueryData<FeedPages>(queryKeys.feed.list(), {
          ...prev,
          pages: prev.pages.map((page, i) =>
            i === 0 ? [optimistic, ...page] : page,
          ),
        });
      }
      return { prev };
    },
    onError: (err, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.feed.list(), ctx.prev);
      uiActions.error("Couldn't post", err.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
  });
}
