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
        // Persist the user record so a page refresh doesn't briefly blank
        // out name/avatar while /me revalidates. /me on the chanakya-astra
        // backend returns a partial payload (no `name`), so we rely on the
        // persisted copy and merge new fields in via setUser.
        user: state.user,
      }),
    },
  ),
);
