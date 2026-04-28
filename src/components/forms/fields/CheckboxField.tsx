"use client";

import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { cn } from "@/lib/cn";

export interface CheckboxFieldProps<TFieldValues extends FieldValues>
  extends UseControllerProps<TFieldValues> {
  label: string;
  className?: string;
  disabled?: boolean;
}

export function CheckboxField<TFieldValues extends FieldValues>({
  label,
  className,
  disabled,
  ...controller
}: CheckboxFieldProps<TFieldValues>) {
  const { field, fieldState } = useController(controller);
  const errorMsg = fieldState.error?.message;
  const id = `field-${String(controller.name)}`;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={id}
        className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
      >
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          checked={Boolean(field.value)}
          onChange={(e) => field.onChange(e.target.checked)}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
        />
        {label}
      </label>
      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
    </div>
  );
}
