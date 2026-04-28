"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { feedService } from "@/services/feed.service";
import { queryKeys } from "@/lib/query-keys";
import { PAGE_SIZE } from "@/constants";

export function useFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.feed.list(),
    queryFn: ({ pageParam }) =>
      feedService.getHome({ skip: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const length = lastPage?.length ?? 0;
      return length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE;
    },
  });
}
