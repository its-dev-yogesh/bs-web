"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { uiActions } from "@/store/actions/ui.actions";
import { appRoutes } from "@/config/routes/app.routes";
import type { RegisterPayload } from "@/schemas/auth.schema";

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterPayload) => authService.register(input),
    onSuccess: (user) => {
      uiActions.success(
        "Account created",
        "Sign in with the OTP we send to your phone.",
      );
      const params = new URLSearchParams({ phone: user.phone });
      router.replace(`${appRoutes.login}?${params.toString()}`);
    },
    onError: (err) => {
      uiActions.error("Registration failed", err.message);
    },
  });
}
