"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { feedService } from "@/services/feed.service";
import { queryKeys } from "@/lib/query-keys";
import { PAGE_SIZE } from "@/constants";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";

export function useFeed() {
  const user = useAppStore(selectUser);
  /** Pass the viewer id so the feed service can exclude the viewer's own
   *  posts from the home timeline. */
  const myId = String(user?._id ?? user?.id ?? "") || undefined;

  return useInfiniteQuery({
    queryKey: [...queryKeys.feed.all, "list", { excludeUserId: myId }] as const,
    queryFn: ({ pageParam }) =>
      feedService.getHome({
        skip: pageParam,
        limit: PAGE_SIZE,
        excludeUserId: myId,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const length = lastPage?.length ?? 0;
      return length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE;
    },
  });
}
