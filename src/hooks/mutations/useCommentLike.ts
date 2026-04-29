"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "@/services/comment.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";

export function useCommentLike(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, liked }: { commentId: string; liked: boolean }) =>
      liked ? commentService.unlike(commentId) : commentService.like(commentId),
    onError: (err: Error) => {
      uiActions.error("Couldn't update comment", err.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.posts.comments(postId) });
    },
  });
}
