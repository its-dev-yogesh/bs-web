"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { messageService } from "@/services/message.service";

export function useMessageThreads(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.messages.threads(),
    queryFn: () => messageService.listThreads(),
    enabled: options?.enabled ?? true,
  });
}

export function useThreadMessages(threadId?: string) {
  return useQuery({
    queryKey: threadId ? queryKeys.messages.thread(threadId) : ["messages", "thread", "none"],
    queryFn: () => messageService.getThread(threadId ?? ""),
    enabled: Boolean(threadId),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, body }: { threadId: string; body: string }) =>
      messageService.send(threadId, body),
    onSuccess: (msg) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.threads() });
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.thread(msg.threadId) });
    },
  });
}
