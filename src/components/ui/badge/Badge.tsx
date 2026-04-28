import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "neutral" | "brand" | "danger" | "success";

const variants: Record<Variant, string> = {
  neutral:
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
  brand: "bg-brand-soft text-brand",
  danger: "bg-danger text-white",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full bg-danger ring-2 ring-surface",
        className,
      )}
    />
  );
}
