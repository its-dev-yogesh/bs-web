import { useAppStore } from "../main.store";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import type { User } from "@/types";

export const authActions = {
  hydrateSession(payload: {
    user: User;
    accessToken: string;
    refreshToken?: string | null;
  }) {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, payload.accessToken);
    if (payload.refreshToken) {
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, payload.refreshToken);
    }
    useAppStore.getState().setSession(payload);
  },

  // Cross-slice: clears auth + composer drafts + toasts in one shot.
  signOut() {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    const s = useAppStore.getState();
    s.clearSession();
    s.resetComposer();
    s.closeModal();
  },
};
