import type { StateCreator } from "zustand";

export type Toast = {
  id: string;
  variant: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
};

export type NotificationsSlice = {
  toasts: Toast[];
  unreadCount: number;
  pushToast: (toast: Omit<Toast, "id">) => string;
  dismissToast: (id: string) => void;
  setUnreadCount: (n: number) => void;
};

let toastSeq = 0;

export const createNotificationsSlice: StateCreator<
  NotificationsSlice,
  [],
  [],
  NotificationsSlice
> = (set) => ({
  toasts: [],
  unreadCount: 0,
  pushToast: (toast) => {
    const id = `t_${++toastSeq}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    return id;
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
});
