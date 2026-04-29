"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageService } from "@/services/message.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";

export function useSendDm() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ targetUserId, body }: { targetUserId: string; body: string }) =>
      messageService.startDirectMessage(targetUserId, body.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.messages.all });
      uiActions.success("Message sent");
    },
    onError: (err: Error) => {
      uiActions.error("Couldn't send message", err.message);
    },
  });
}
