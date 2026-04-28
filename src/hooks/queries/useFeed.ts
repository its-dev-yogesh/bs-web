"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { feedService } from "@/services/feed.service";
import { queryKeys } from "@/lib/query-keys";
import { PAGE_SIZE } from "@/constants";

export function useFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.feed.list(),
    queryFn: ({ pageParam }) =>
      feedService.getHome({ cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}
