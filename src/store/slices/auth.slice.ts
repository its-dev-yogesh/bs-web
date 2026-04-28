import type { StateCreator } from "zustand";
import type { User } from "@/types";

export type AuthSessionPayload = {
  user: User;
  accessToken: string;
  refreshToken?: string | null;
};

export type AuthSlice = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setSession: (payload: AuthSessionPayload) => void;
  setUser: (user: User | null) => void;
  setHydrated: (v: boolean) => void;
  clearSession: () => void;
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
  set,
) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,
  setSession: ({ user, accessToken, refreshToken }) =>
    set({
      user,
      accessToken,
      refreshToken: refreshToken ?? null,
      isHydrated: true,
    }),
  setUser: (user) => set({ user }),
  setHydrated: (v) => set({ isHydrated: v }),
  clearSession: () =>
    set({ user: null, accessToken: null, refreshToken: null }),
});
