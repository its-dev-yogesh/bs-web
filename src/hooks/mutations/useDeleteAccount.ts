"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { userService } from "@/services/user.service";
import { authActions } from "@/store/actions/auth.actions";
import { appRoutes } from "@/config/routes/app.routes";
import { uiActions } from "@/store/actions/ui.actions";

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      authActions.signOut();
      queryClient.clear();
      uiActions.success("Account deleted");
      router.replace(appRoutes.register);
    },
  });
}
