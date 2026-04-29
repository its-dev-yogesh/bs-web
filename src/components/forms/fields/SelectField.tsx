"use client";

import { useEffect, useRef, useState } from "react";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((o) => o.value === field.value) ?? options[0];

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={containerRef} className={cn("flex flex-col gap-1.5 relative", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-foreground"
        >
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        disabled={disabled}
        data-invalid={Boolean(errorMsg) || undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-10 w-full rounded-lg border bg-surface px-3 text-[13px] shadow-sm transition focus:outline-none focus:ring-2",
          "border-surface-border text-foreground focus:border-brand focus:ring-brand/20",
          errorMsg &&
            "border-red-500 text-red-700 focus:border-red-500 focus:ring-red-500/20 dark:text-red-400",
          "disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-between text-left",
        )}
      >
        <span className="truncate">{selected?.label ?? "Select option"}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute z-20 mt-[58px] max-h-56 w-full overflow-auto rounded-lg border border-surface-border bg-surface shadow-lg">
          {options.map((o) => {
            const active = o.value === selected?.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  field.onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-[13px] transition",
                  active
                    ? "bg-brand-soft text-brand font-semibold"
                    : "text-foreground hover:bg-surface-muted",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      ) : null}
      {(errorMsg || hint) && (
        <p
          className={cn(
            "text-xs",
            errorMsg ? "text-red-500" : "text-muted-foreground",
          )}
        >
          {errorMsg ?? hint}
        </p>
      )}
    </div>
  );
}
