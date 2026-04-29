"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";
import type { UpdateProfileInput } from "@/schemas/profile.schema";

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UpdateProfileInput> }) =>
      userService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile.all });
      qc.invalidateQueries({ queryKey: queryKeys.auth.me() });
      qc.invalidateQueries({ queryKey: queryKeys.feed.all });
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
      uiActions.success("Profile updated");
    },
    onError: (error: Error) => {
      uiActions.error("Couldn't update profile", error.message);
    },
  });
}
