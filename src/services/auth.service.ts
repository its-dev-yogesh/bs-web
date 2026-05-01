import { api } from "@/lib/axios";
import { apiRoutes } from "@/config/routes/api.routes";
import type {
  LoginInput,
  RegisterPayload,
  ResendOtpInput,
  VerifyOtpInput,
} from "@/schemas/auth.schema";
import type { User } from "@/types";

export type OtpChallenge = {
  phone: string;
  message: string;
};

export type AuthSession = {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

export type RefreshResponse = {
  access_token: string;
  expires_in: number;
};

// astra-service uses `phoneNumber`; UI keeps the legacy `phone` field name.
// These helpers translate at the network boundary so the forms don't change.
function toBackend<T extends { phone?: string }>(input: T) {
  const { phone, ...rest } = input as T & { phone?: string };
  return phone === undefined ? rest : { ...rest, phoneNumber: phone };
}
function fromBackend<T extends { phoneNumber?: string }>(input: T) {
  const { phoneNumber, ...rest } = input as T & { phoneNumber?: string };
  return phoneNumber === undefined
    ? (input as unknown as T & { phone?: string })
    : ({ ...rest, phone: phoneNumber } as T & { phone: string });
}

export const authService = {
  async register(input: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>(
      apiRoutes.users.create,
      toBackend(input),
    );
    return data;
  },

  async login(input: LoginInput): Promise<OtpChallenge> {
    const { data } = await api.post<{ phoneNumber: string; message: string }>(
      apiRoutes.auth.login,
      toBackend(input),
    );
    return fromBackend(data) as OtpChallenge;
  },

  async verifyOtp(input: VerifyOtpInput): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>(
      apiRoutes.auth.verifyOtp,
      toBackend(input),
    );
    return data;
  },

  async resendOtp(input: ResendOtpInput): Promise<OtpChallenge> {
    const { data } = await api.post<{ phoneNumber: string; message: string }>(
      apiRoutes.auth.resendOtp,
      toBackend(input),
    );
    return fromBackend(data) as OtpChallenge;
  },

  async logout(): Promise<void> {
    await api.post(apiRoutes.auth.logout);
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>(apiRoutes.auth.me);
    return data;
  },

  async refresh(refresh_token: string): Promise<RefreshResponse> {
    const { data } = await api.post<RefreshResponse>(apiRoutes.auth.refresh, {
      refresh_token,
    });
    return data;
  },
};
