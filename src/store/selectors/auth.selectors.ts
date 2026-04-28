import type { AppState } from "../main.store";

export const selectUser = (s: AppState) => s.user;
export const selectAccessToken = (s: AppState) => s.accessToken;
export const selectIsAuthenticated = (s: AppState) => Boolean(s.user);
export const selectIsHydrated = (s: AppState) => s.isHydrated;
