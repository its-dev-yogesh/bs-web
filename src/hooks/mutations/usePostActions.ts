"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";

function invalidatePostQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
}

export type UpdatePostInput = {
  id: string;
  title?: string;
  description?: string;
  location_text?: string;
  whatsapp_number?: string;
  postType?: "listing" | "requirement";
  // listing fields
  price?: number;
  listing_type?: string;
  property_type?: string;
  project_type?: string;
  project_status?: string;
  config?: string;
  address?: string;
  area_sqft?: number;
  bhk?: number;
  bathrooms?: number;
  amenities?: string[];
  // requirement fields
  budget_min?: number;
  budget_max?: number;
  preferred_amenities?: string[];
  preferred_location_text?: string;
  // media changes — only honored when post has no engagement
  addMedia?: Array<{ url: string; type: "image" | "video" | "document" }>;
  removeMediaIds?: string[];
};

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      addMedia,
      removeMediaIds,
      ...rest
    }: UpdatePostInput) => {
      if (removeMediaIds && removeMediaIds.length > 0) {
        await Promise.all(removeMediaIds.map((mid) => postService.removeMedia(mid)));
      }
      if (addMedia && addMedia.length > 0) {
        for (let i = 0; i < addMedia.length; i++) {
          await postService.addMedia(id, { ...addMedia[i], orderIndex: i });
        }
      }
      return postService.update(id, rest);
    },
    onSuccess: () => {
      invalidatePostQueries(queryClient);
      uiActions.success("Post updated");
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.remove(id),
    onSuccess: () => {
      invalidatePostQueries(queryClient);
      uiActions.success("Post deleted");
    },
  });
}
