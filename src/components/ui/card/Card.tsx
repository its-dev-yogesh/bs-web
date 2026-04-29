import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[24px] bg-surface shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardSection({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function CardDivider({ className }: { className?: string }) {
  return (
    <hr
      className={cn("border-0 border-t border-surface-border", className)}
    />
  );
}
