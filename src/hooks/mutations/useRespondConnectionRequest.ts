"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { connectionService } from "@/services/connection.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";

export function useRespondConnectionRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      action,
    }: {
      requestId: string;
      action: "accept" | "decline";
    }) =>
      action === "accept"
        ? connectionService.acceptRequest(requestId)
        : connectionService.declineRequest(requestId),
    onSuccess: (_, { action }) => {
      qc.invalidateQueries({ queryKey: queryKeys.profile.all });
      qc.invalidateQueries({ queryKey: queryKeys.connections.all });
      qc.invalidateQueries({ queryKey: queryKeys.feed.all });
      uiActions.success(
        action === "accept" ? "You're now connected" : "Request declined",
      );
    },
    onError: (err: Error) => {
      uiActions.error("Couldn't update request", err.message);
    },
  });
}
