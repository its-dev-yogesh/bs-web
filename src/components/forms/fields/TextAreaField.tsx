"use client";

import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { cn } from "@/lib/cn";

export interface TextAreaFieldProps<TFieldValues extends FieldValues>
  extends UseControllerProps<TFieldValues> {
  label?: string;
  placeholder?: string;
  hint?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function TextAreaField<TFieldValues extends FieldValues>({
  label,
  placeholder,
  hint,
  rows = 4,
  className,
  disabled,
  maxLength,
  ...controller
}: TextAreaFieldProps<TFieldValues>) {
  const { field, fieldState } = useController(controller);
  const errorMsg = fieldState.error?.message;
  const id = `field-${String(controller.name)}`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={cn(
          "w-full rounded-lg border bg-surface px-4 py-3 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground focus:outline-none focus:ring-2",
          "border-surface-border focus:border-brand focus:ring-brand/20",
          errorMsg &&
            "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
        {...field}
        value={field.value ?? ""}
      />
      {(errorMsg || hint) && (
        <p
          className={cn(
            "text-xs",
            errorMsg
              ? "text-red-500"
              : "text-gray-500 dark:text-gray-400",
          )}
        >
          {errorMsg ?? hint}
        </p>
      )}
    </div>
  );
}
