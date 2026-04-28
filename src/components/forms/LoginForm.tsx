"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  loginSchema,
  verifyOtpSchema,
  type LoginInput,
  type VerifyOtpInput,
} from "@/schemas/auth.schema";
import { useLogin } from "@/hooks/mutations/useLogin";
import { useVerifyOtp } from "@/hooks/mutations/useVerifyOtp";
import { useResendOtp } from "@/hooks/mutations/useResendOtp";
import { Button } from "@/components/ui/button/Button";
import { TextField } from "./fields/TextField";
import { appRoutes } from "@/config/routes/app.routes";

export function LoginForm() {
  const searchParams = useSearchParams();
  const prefilledPhone = searchParams.get("phone") ?? "";
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState(prefilledPhone);

  const phoneForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: prefilledPhone },
  });

  const otpForm = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phone: prefilledPhone, otp_code: "" },
  });

  const startLogin = useLogin({
    onSuccess: (_challenge, input) => {
      setPhone(input.phone);
      otpForm.reset({ phone: input.phone, otp_code: "" });
      setStep("otp");
    },
  });
  const verify = useVerifyOtp();
  const resend = useResendOtp();

  useEffect(() => {
    if (prefilledPhone) {
      phoneForm.reset({ phone: prefilledPhone });
      otpForm.reset({ phone: prefilledPhone, otp_code: "" });
    }
  }, [prefilledPhone, phoneForm, otpForm]);

  if (step === "phone") {
    return (
      <form
        onSubmit={phoneForm.handleSubmit((v) => startLogin.mutate(v))}
        className="flex flex-col gap-5"
      >
        <TextField
          control={phoneForm.control}
          name="phone"
          label="Phone"
          type="tel"
          placeholder="+919876543210"
          autoComplete="tel"
          hint="We'll send a 6-digit code to this number."
        />
        <Button
          type="submit"
          loading={startLogin.isPending}
          className="w-full"
        >
          Send OTP
        </Button>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href={appRoutes.register}
            className="text-blue-600 hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form
      onSubmit={otpForm.handleSubmit((v) => verify.mutate(v))}
      className="flex flex-col gap-5"
    >
      <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:bg-blue-500/10 dark:text-blue-200">
        Enter the 6-digit code sent to{" "}
        <span className="font-semibold">{phone}</span>.
      </div>

      <TextField
        control={otpForm.control}
        name="otp_code"
        label="OTP"
        type="text"
        placeholder="123456"
        autoComplete="one-time-code"
      />

      <Button type="submit" loading={verify.isPending} className="w-full">
        Verify and sign in
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="text-gray-600 hover:underline dark:text-gray-300"
        >
          Use a different number
        </button>
        <button
          type="button"
          disabled={resend.isPending}
          onClick={() => resend.mutate({ phone })}
          className="text-blue-600 hover:underline disabled:opacity-60"
        >
          {resend.isPending ? "Resending…" : "Resend OTP"}
        </button>
      </div>
    </form>
  );
}
