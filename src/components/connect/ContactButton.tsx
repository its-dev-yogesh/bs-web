"use client";

import React from "react";
import { cn } from "@/lib/cn";

type ContactButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
  variant?: "primary" | "outline";
};

export function ContactButton({
  onClick,
  label = "Contact",
  className,
  variant = "primary",
}: ContactButtonProps) {
  const baseClass = "inline-flex items-center justify-center gap-1.5 transition-all duration-200 font-bold active:scale-95 disabled:opacity-70";
  
  const variantClasses = {
    primary: "px-5 py-1.5 rounded-full bg-brand hover:bg-brand-hover text-white text-[14px] shadow-sm",
    outline: "px-4 py-1 rounded-full border border-brand text-brand hover:bg-brand-soft text-[12px]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(baseClass, variantClasses[variant], className)}
    >
      {label}
    </button>
  );
}
