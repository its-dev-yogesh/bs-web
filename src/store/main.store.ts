"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createAuthSlice, type AuthSlice } from "./slices/auth.slice";
import { createUiSlice, type UiSlice } from "./slices/ui.slice";
import {
  createComposerSlice,
  type ComposerSlice,
} from "./slices/composer.slice";
import {
  createNotificationsSlice,
  type NotificationsSlice,
} from "./slices/notifications.slice";

export type AppState = AuthSlice & UiSlice & ComposerSlice & NotificationsSlice;

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createUiSlice(...a),
      ...createComposerSlice(...a),
      ...createNotificationsSlice(...a),
    }),
    {
      name: "bs.app",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        // session is restored from /me query — only persist UI prefs.
      }),
    },
  ),
);
