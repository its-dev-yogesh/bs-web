"use client";

import { useQuery } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";

export function useListings(params: {
  type?: "listing" | "requirement";
  user_id?: string;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: queryKeys.posts.detail(JSON.stringify({ list: true, ...params })),
    queryFn: () => postService.list(params),
    staleTime: 30_000,
  });
}

export function useSavedPosts() {
  return useQuery({
    queryKey: ["saved-posts"] as const,
    queryFn: () => postService.savedList(),
    staleTime: 30_000,
  });
}
