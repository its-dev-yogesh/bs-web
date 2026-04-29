"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";
import type { Comment, Post } from "@/types";

type FeedPages = { pages: Post[][]; pageParams: unknown[] };

export function useCommentPost(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: string | null;
    }) => postService.createComment(postId, content, parentId),
    onSuccess: (created) => {
      qc.setQueryData<Comment[]>(
        queryKeys.posts.comments(postId),
        (prev) => (prev ? [...prev, created] : [created]),
      );

      const feed = qc.getQueryData<FeedPages>(queryKeys.feed.list());
      if (feed) {
        qc.setQueryData<FeedPages>(queryKeys.feed.list(), {
          ...feed,
          pages: feed.pages.map((page) =>
            page.map((p) =>
              p.id === postId
                ? { ...p, commentCount: p.commentCount + 1 }
                : p,
            ),
          ),
        });
      }
    },
  });
}
