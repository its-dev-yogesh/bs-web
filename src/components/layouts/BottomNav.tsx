"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { bottomNav } from "@/config/nav";
import { Icon } from "@/components/icons/icons";
import { Dot } from "@/components/ui/badge/Badge";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams();

  const openCompose = () => {
    const params = new URLSearchParams(search?.toString() ?? "");
    params.set("compose", "1");
    router.push(`/?${params.toString()}`);
  };

  return (
    <nav
      aria-label="Primary"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-surface-border bg-surface/95 px-2 backdrop-blur md:hidden"
    >
      {bottomNav.map((item) => {
        if (item.kind === "action") {
          return (
            <button
              key={item.label}
              onClick={openCompose}
              className="flex flex-1 flex-col items-center justify-center pt-2 pb-1"
              aria-label={item.label}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-md transition active:scale-95">
                <Icon name={item.icon} width={26} height={26} strokeWidth={2.4} />
              </span>
              <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                {item.label}
              </span>
            </button>
          );
        }
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-1 flex-col items-center justify-center gap-0.5 pt-2 pb-1"
          >
            <span
              className={cn(
                "relative flex items-center justify-center transition",
                active ? "text-brand" : "text-muted-foreground",
              )}
            >
              <Icon name={item.icon} width={24} height={24} />
              {item.badge ? (
                <Dot className="absolute -right-1 -top-1" />
              ) : null}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium",
                active ? "text-brand" : "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
