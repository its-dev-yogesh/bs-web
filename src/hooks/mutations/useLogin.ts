"use client";

import { useMutation } from "@tanstack/react-query";
import { authService, type OtpChallenge } from "@/services/auth.service";
import { uiActions } from "@/store/actions/ui.actions";
import type { LoginInput } from "@/schemas/auth.schema";

export function useLogin(options?: {
  onSuccess?: (challenge: OtpChallenge, input: LoginInput) => void;
}) {
  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (challenge, input) => {
      uiActions.success("OTP sent", challenge.message);
      options?.onSuccess?.(challenge, input);
    },
    onError: (err) => {
      uiActions.error("Could not send OTP", err.message);
    },
  });
}
