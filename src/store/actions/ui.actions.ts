import { useAppStore } from "../main.store";
import type { Toast } from "../slices/notifications.slice";

export const uiActions = {
  toast(t: Omit<Toast, "id">) {
    return useAppStore.getState().pushToast(t);
  },
  success(title: string, description?: string) {
    return useAppStore
      .getState()
      .pushToast({ variant: "success", title, description });
  },
  error(title: string, description?: string) {
    return useAppStore
      .getState()
      .pushToast({ variant: "error", title, description });
  },
};
