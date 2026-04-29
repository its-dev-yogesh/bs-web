"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/main.store";
import type { Toast } from "@/store/slices/notifications.slice";
import { Icon } from "@/components/icons/icons";
import { cn } from "@/lib/cn";

const VARIANT_STYLES: Record<Toast["variant"], string> = {
  success: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  error: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  info: "border-surface-border bg-surface text-foreground",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

const AUTO_DISMISS_MS = 4000;

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useAppStore((s) => s.dismissToast);

  useEffect(() => {
    const id = window.setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(id);
  }, [toast.id, dismiss]);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-3 py-2.5 shadow-lg",
        VARIANT_STYLES[toast.variant],
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 text-xs opacity-80">{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dismiss(toast.id)}
        className="shrink-0 rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Icon name="close" width={14} height={14} />
      </button>
    </div>
  );
}
