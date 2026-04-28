"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { authActions } from "@/store/actions/auth.actions";
import { uiActions } from "@/store/actions/ui.actions";
import { queryKeys } from "@/lib/query-keys";
import { appRoutes } from "@/config/routes/app.routes";
import type { VerifyOtpInput } from "@/schemas/auth.schema";

export function useVerifyOtp() {
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyOtpInput) => authService.verifyOtp(input),
    onSuccess: (session) => {
      authActions.hydrateSession({
        user: session.user,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      });
      qc.setQueryData(queryKeys.auth.me(), session.user);
      uiActions.success(
        `Welcome, ${session.user.name ?? session.user.username}`,
      );
      router.replace(appRoutes.feed);
    },
    onError: (err) => {
      uiActions.error("Verification failed", err.message);
    },
  });
}
