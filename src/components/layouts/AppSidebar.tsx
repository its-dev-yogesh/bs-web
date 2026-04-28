"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/config/nav";
import { Icon } from "@/components/icons/icons";
import { cn } from "@/lib/cn";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-surface-border bg-surface p-4 md:block">
      <nav className="flex flex-col gap-1">
        {mainNav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-brand-soft font-medium text-brand"
                  : "text-foreground hover:bg-surface-muted",
              )}
            >
              <Icon name={item.icon} width={20} height={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
