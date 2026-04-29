"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";

function invalidatePostQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      title,
      description,
      location_text,
      whatsapp_number,
    }: {
      id: string;
      title?: string;
      description?: string;
      location_text?: string;
      whatsapp_number?: string;
    }) =>
      postService.update(id, {
        title,
        description,
        location_text,
        whatsapp_number,
      }),
    onSuccess: () => {
      invalidatePostQueries(queryClient);
      uiActions.success("Post updated");
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.remove(id),
    onSuccess: () => {
      invalidatePostQueries(queryClient);
      uiActions.success("Post deleted");
    },
  });
}
