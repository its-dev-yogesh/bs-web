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

export const authService = {
  async register(input: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>(apiRoutes.users.create, input);
    return data;
  },

  async login(input: LoginInput): Promise<OtpChallenge> {
    const { data } = await api.post<OtpChallenge>(apiRoutes.auth.login, input);
    return data;
  },

  async verifyOtp(input: VerifyOtpInput): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>(
      apiRoutes.auth.verifyOtp,
      input,
    );
    return data;
  },

  async resendOtp(input: ResendOtpInput): Promise<OtpChallenge> {
    const { data } = await api.post<OtpChallenge>(
      apiRoutes.auth.resendOtp,
      input,
    );
    return data;
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
