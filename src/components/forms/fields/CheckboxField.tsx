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
        className="inline-flex items-center gap-2 text-sm text-foreground"
      >
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          checked={Boolean(field.value)}
          {...field}
          className="h-4 w-4 rounded border-surface-border text-brand focus:ring-brand"
        />
        {label}
      </label>
      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
    </div>
  );
}
