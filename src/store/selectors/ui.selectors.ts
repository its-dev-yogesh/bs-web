import type { AppState } from "../main.store";

export const selectTheme = (s: AppState) => s.theme;
export const selectIsSidebarOpen = (s: AppState) => s.isSidebarOpen;
export const selectActiveModal = (s: AppState) => s.activeModal;
export const selectModalPayload = (s: AppState) => s.modalPayload;
export const selectToasts = (s: AppState) => s.toasts;
