import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "./env";
import { storage, STORAGE_KEYS } from "./storage";
import { toApiError } from "./api-error";

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
    /** Avoid browser/proxy serving stale JSON for GET /connections etc. (304 + wrong UI state). */
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];
const resolvePending = (token: string | null) => {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
};

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/verify-otp") ||
    url.includes("/auth/resend-otp") ||
    url.includes("/auth/refresh")
  );
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (status !== 401 || !original) {
      return Promise.reject(toApiError(error));
    }
    if (original._retry || isAuthEndpoint(original.url)) {
      if (onUnauthorized) onUnauthorized();
      return Promise.reject(toApiError(error));
    }

    const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      const hasAccessToken = Boolean(storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN));
      if (hasAccessToken && onUnauthorized) onUnauthorized();
      return Promise.reject(toApiError(error));
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(toApiError(error));
            return;
          }
          if (original.headers) original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;
    try {
      const refreshResp = await axios.post<{ access_token: string }>(
        `${env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { "Content-Type": "application/json" }, withCredentials: true, timeout: 20000 },
      );
      const newToken = refreshResp.data?.access_token;
      if (!newToken) throw new Error("No refreshed access token");
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, newToken);
      resolvePending(newToken);
      if (original.headers) original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      resolvePending(null);
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      if (onUnauthorized) onUnauthorized();
      return Promise.reject(toApiError(error));
    } finally {
      isRefreshing = false;
    }
  },
);
