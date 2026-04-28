const isBrowser = () => typeof window !== "undefined";

export const storage = {
  get<T = string>(key: string): T | null {
    if (!isBrowser()) return null;
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  },
  set(key: string, value: unknown) {
    if (!isBrowser()) return;
    window.localStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  },
  remove(key: string) {
    if (!isBrowser()) return;
    window.localStorage.removeItem(key);
  },
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "bs.access_token",
  REFRESH_TOKEN: "bs.refresh_token",
  THEME: "bs.theme",
} as const;
