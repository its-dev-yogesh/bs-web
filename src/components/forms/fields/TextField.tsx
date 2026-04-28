"use client";

import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { InputField } from "@/components/ui/input/InputField";
import { cn } from "@/lib/cn";

export interface TextFieldProps<TFieldValues extends FieldValues>
  extends UseControllerProps<TFieldValues> {
  label?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
}

export function TextField<TFieldValues extends FieldValues>({
  label,
  type = "text",
  placeholder,
  autoComplete,
  hint,
  className,
  disabled,
  ...controller
}: TextFieldProps<TFieldValues>) {
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
      <InputField
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        error={Boolean(errorMsg)}
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
