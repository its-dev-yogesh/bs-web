"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  registerSchema,
  type RegisterInput,
  type RegisterPayload,
} from "@/schemas/auth.schema";
import { useRegister } from "@/hooks/mutations/useRegister";
import { Button } from "@/components/ui/button/Button";
import { TextField } from "./fields/TextField";
import { CheckboxField } from "./fields/CheckboxField";
import { SelectField } from "./fields/SelectField";
import { appRoutes } from "@/config/routes/app.routes";

const TYPE_OPTIONS = [
  { value: "user", label: "User — looking for property" },
  { value: "agent", label: "Agent — listing properties" },
] as const;

export function RegisterForm() {
  const { mutate, isPending } = useRegister();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      type: "user",
      acceptTerms: false as unknown as true,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const payload: RegisterPayload = {
      username: values.username,
      phone: values.phone,
      password: values.password,
      type: values.type,
      ...(values.email ? { email: values.email } : {}),
    };
    mutate(payload);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <TextField
        control={form.control}
        name="username"
        label="Username"
        placeholder="johndoe"
        autoComplete="username"
      />
      <TextField
        control={form.control}
        name="phone"
        label="Phone"
        type="tel"
        placeholder="+919876543210"
        autoComplete="tel"
        hint="E.164 format with country code, e.g. +919876543210"
      />
      <TextField
        control={form.control}
        name="email"
        label="Email (optional)"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
      />
      <SelectField
        control={form.control}
        name="type"
        label="Account type"
        options={TYPE_OPTIONS}
      />
      <TextField
        control={form.control}
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
      />
      <TextField
        control={form.control}
        name="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
      />
      <CheckboxField
        control={form.control}
        name="acceptTerms"
        label="I agree to the Terms of Service"
      />
      <Button type="submit" loading={isPending} className="w-full h-10 text-[13px]">
        Create account
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={appRoutes.login} className="text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
