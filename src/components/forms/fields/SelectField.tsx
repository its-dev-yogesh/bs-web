"use client";

import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps<TFieldValues extends FieldValues>
  extends UseControllerProps<TFieldValues> {
  label?: string;
  options: readonly SelectOption[];
  hint?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectField<TFieldValues extends FieldValues>({
  label,
  options,
  hint,
  className,
  disabled,
  ...controller
}: SelectFieldProps<TFieldValues>) {
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
      <select
        id={id}
        disabled={disabled}
        aria-invalid={Boolean(errorMsg) || undefined}
        {...field}
        value={field.value ?? ""}
        className={cn(
          "h-11 w-full rounded-lg border bg-transparent px-3 text-sm shadow-sm transition focus:outline-none focus:ring-2",
          "border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-700 dark:text-gray-100",
          errorMsg &&
            "border-red-500 text-red-700 focus:border-red-500 focus:ring-red-500/20 dark:text-red-400",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {(errorMsg || hint) && (
        <p
          className={cn(
            "text-xs",
            errorMsg ? "text-red-500" : "text-gray-500 dark:text-gray-400",
          )}
        >
          {errorMsg ?? hint}
        </p>
      )}
    </div>
  );
}
