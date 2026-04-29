"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ error, success, className, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={error || undefined}
        className={cn(
          "h-10 w-full rounded-lg border bg-surface px-3 text-[13px] shadow-sm transition placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2",
          "border-surface-border text-foreground focus:border-brand focus:ring-brand/20",
          error &&
            "border-red-500 text-red-700 focus:border-red-500 focus:ring-red-500/20 dark:text-red-400",
          success &&
            "border-green-500 text-green-700 focus:border-green-500 focus:ring-green-500/20 dark:text-green-400",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...rest}
      />
    );
  },
);
InputField.displayName = "InputField";
