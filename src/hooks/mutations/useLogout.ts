"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { authActions } from "@/store/actions/auth.actions";
import { appRoutes } from "@/config/routes/app.routes";

export function useLogout() {
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      authActions.signOut();
      qc.clear();
      router.replace(appRoutes.login);
    },
  });
}
