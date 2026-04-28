"use client";

import { useAppStore } from "@/store/main.store";

export function useModal(key: string) {
  const activeModal = useAppStore((s) => s.activeModal);
  const payload = useAppStore((s) => s.modalPayload);
  const open = useAppStore((s) => s.openModal);
  const close = useAppStore((s) => s.closeModal);

  return {
    isOpen: activeModal === key,
    payload,
    open: (data?: unknown) => open(key, data),
    close,
  };
}
