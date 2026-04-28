import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/constants";
import { emailSchema, usernameSchema } from "./common.schema";

// E.164: leading +, 8–15 digits.
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Use E.164 format, e.g. +919876543210");

const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

export const loginSchema = z.object({
  phone: phoneSchema,
});
export type LoginInput = z.infer<typeof loginSchema>;

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp_code: otpCodeSchema,
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const resendOtpSchema = z.object({
  phone: phoneSchema,
});
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;

export const registerSchema = z
  .object({
    username: usernameSchema,
    phone: phoneSchema,
    email: emailSchema.optional().or(z.literal("")),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `At least ${PASSWORD_MIN_LENGTH} characters`),
    confirmPassword: z.string(),
    type: z.enum(["user", "agent"]),
    acceptTerms: z.literal(true, { message: "You must accept the terms" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type RegisterInput = z.infer<typeof registerSchema>;

// Payload actually sent to POST /users (no confirmPassword / acceptTerms).
export type RegisterPayload = {
  username: string;
  phone: string;
  email?: string;
  password: string;
  type: "user" | "agent";
};
