"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { connectionService } from "@/services/connection.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";
import type { PublicProfile } from "@/types";

export function useUnfollowBroker() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => connectionService.unfollow(userId),
    onSuccess: (_, targetUserId) => {
      const tid = String(targetUserId).trim();
      qc.setQueriesData<PublicProfile>(
        { queryKey: queryKeys.profile.all },
        (old) => {
          if (!old) return old;
          const id = String(old._id ?? old.id ?? "").trim();
          if (id !== tid) return old;
          return {
            ...old,
            isConnected: false,
            isPendingRequest: false,
            pendingOutgoing: false,
            pendingIncoming: false,
          };
        },
      );
      qc.invalidateQueries({ queryKey: queryKeys.connections.all });
      qc.invalidateQueries({ queryKey: queryKeys.profile.all });
      qc.invalidateQueries({ queryKey: queryKeys.feed.all });
      qc.invalidateQueries({ queryKey: queryKeys.stories.all });
      uiActions.success("Unfollowed");
    },
    onError: (err: Error) => {
      uiActions.error("Couldn't unfollow", err.message);
    },
  });
}
