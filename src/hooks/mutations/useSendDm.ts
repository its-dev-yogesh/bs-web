"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageService } from "@/services/message.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";

export function useSendDm() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetUserId,
      body,
      postId,
    }: {
      targetUserId: string;
      body: string;
      postId?: string;
    }) => messageService.startDirectMessage(targetUserId, body.trim(), postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.messages.all });
      uiActions.success("Message sent");
    },
    onError: (err: Error) => {
      uiActions.error("Couldn't send message", err.message);
    },
  });
}
