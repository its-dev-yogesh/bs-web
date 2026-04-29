"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followService, type FollowStatus } from "@/services/follow.service";
import { queryKeys } from "@/lib/query-keys";
import type { Post } from "@/types";

type FeedPages = { pages: Post[][]; pageParams: unknown[] };

/**
 * Toggle follow for a user — updates the per-user follow-status query and
 * also patches any feed cache entries authored by this user so the feed
 * reflects the new state without a refetch.
 */
export function useToggleFollow(userId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (currentlyFollowing: boolean) =>
      currentlyFollowing
        ? followService.unfollow(userId)
        : followService.follow(userId),
    onMutate: async (currentlyFollowing): Promise<{
      prevStatus: FollowStatus | undefined;
      prevFeed: FeedPages | undefined;
    }> => {
      await qc.cancelQueries({ queryKey: queryKeys.follows.status(userId) });
      await qc.cancelQueries({ queryKey: queryKeys.feed.all });

      const prevStatus = qc.getQueryData<FollowStatus>(
        queryKeys.follows.status(userId),
      );
      if (prevStatus) {
        qc.setQueryData<FollowStatus>(queryKeys.follows.status(userId), {
          ...prevStatus,
          is_following: !currentlyFollowing,
          followers_count: Math.max(
            0,
            prevStatus.followers_count + (currentlyFollowing ? -1 : 1),
          ),
        });
      }

      const prevFeed = qc.getQueryData<FeedPages>(queryKeys.feed.list());
      if (prevFeed) {
        qc.setQueryData<FeedPages>(queryKeys.feed.list(), {
          ...prevFeed,
          pages: prevFeed.pages.map((page) =>
            page.map((p) =>
              p.author.id === userId
                ? { ...p, followingAuthor: !currentlyFollowing }
                : p,
            ),
          ),
        });
      }

      return { prevStatus, prevFeed };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevStatus)
        qc.setQueryData(queryKeys.follows.status(userId), ctx.prevStatus);
      if (ctx?.prevFeed)
        qc.setQueryData(queryKeys.feed.list(), ctx.prevFeed);
    },
  });
}
