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
      // Instagram-style instant follow: drop the user from suggestions and
      // mark the cached profile as connected straight away.
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
            isConnected: true,
            pendingOutgoing: false,
            // If they followed us first, we've now reciprocated.
            pendingIncoming: false,
            isPendingRequest: false,
          };
        },
      );
      qc.invalidateQueries({ queryKey: queryKeys.connections.all });
      qc.invalidateQueries({ queryKey: queryKeys.profile.all });
      qc.invalidateQueries({ queryKey: queryKeys.feed.all });
      qc.invalidateQueries({ queryKey: queryKeys.stories.all });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      uiActions.success("Following");
    },
    onError: (err: Error) => {
      uiActions.error("Couldn't follow", err.message);
    },
  });
}
