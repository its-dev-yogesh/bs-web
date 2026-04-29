import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/common/Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-muted px-4">
      <div className="w-full max-w-[390px] rounded-2xl border border-surface-border bg-surface p-6 shadow-sm md:p-7">
        <div className="mb-5 text-center flex flex-col items-center">
          <Logo className="w-12 h-12 mb-3" />
          <h1 className="text-lg font-bold tracking-tight text-foreground">{siteConfig.name}</h1>
          <h2 className="mt-2 text-xl font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
