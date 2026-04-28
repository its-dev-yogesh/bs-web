"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { uiActions } from "@/store/actions/ui.actions";
import type { ResendOtpInput } from "@/schemas/auth.schema";

export function useResendOtp() {
  return useMutation({
    mutationFn: (input: ResendOtpInput) => authService.resendOtp(input),
    onSuccess: (challenge) => {
      uiActions.success("OTP resent", challenge.message);
    },
    onError: (err) => {
      uiActions.error("Could not resend OTP", err.message);
    },
  });
}
