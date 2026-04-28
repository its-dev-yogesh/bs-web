import type { StateCreator } from "zustand";

export type Theme = "light" | "dark" | "system";

export type UiSlice = {
  theme: Theme;
  isSidebarOpen: boolean;
  activeModal: string | null;
  modalPayload: unknown;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  openModal: (key: string, payload?: unknown) => void;
  closeModal: () => void;
};

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  theme: "system",
  isSidebarOpen: false,
  activeModal: null,
  modalPayload: null,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (v) => set({ isSidebarOpen: v }),
  openModal: (key, payload) => set({ activeModal: key, modalPayload: payload }),
  closeModal: () => set({ activeModal: null, modalPayload: null }),
});
