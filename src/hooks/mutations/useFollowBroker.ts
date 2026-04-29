"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { connectionService } from "@/services/connection.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";
import type { PublicProfile } from "@/types";

export function useFollowBroker() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => connectionService.sendRequest(userId),
    onSuccess: (_, targetUserId) => {
      const tid = String(targetUserId).trim();
      qc.setQueryData(
        queryKeys.connections.suggestions(),
        (old: PublicProfile[] | undefined) =>
          (old ?? []).filter(
            (p) => String(p._id ?? p.id ?? "").trim() !== tid,
          ),
      );
      qc.setQueriesData<PublicProfile>(
        { queryKey: queryKeys.profile.all },
        (old) => {
          if (!old) return old;
          const id = String(old._id ?? old.id ?? "").trim();
          if (id !== tid) return old;
          return {
            ...old,
            pendingOutgoing: true,
            isPendingRequest: true,
          };
        },
      );
      qc.invalidateQueries({ queryKey: queryKeys.connections.all });
      qc.invalidateQueries({ queryKey: queryKeys.profile.all });
      qc.invalidateQueries({ queryKey: queryKeys.feed.all });
      uiActions.success("Connection request sent");
    },
    onError: (err: Error) => {
      uiActions.error("Couldn't send request", err.message);
    },
  });
}
