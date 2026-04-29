"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Plus, Bell, Briefcase } from "lucide-react";
import { cn } from "@/lib/cn";
import { appRoutes } from "@/config/routes/app.routes";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppStore(selectUser);
  const isLoggedIn = Boolean(user?._id ?? user?.id);

  const alertsHref = isLoggedIn
    ? appRoutes.notifications
    : `${appRoutes.login}?returnUrl=${encodeURIComponent(appRoutes.notifications)}`;

  const navItems = [
    { label: "Home", href: appRoutes.home, icon: Home },
    { label: "Brokers", href: appRoutes.network, icon: Users },
    { label: "Post", href: appRoutes.compose, icon: Plus, isAction: true },
    { label: "Alerts", href: alertsHref, icon: Bell, badge: isLoggedIn },
    { label: "Listings", href: appRoutes.listings, icon: Briefcase },
  ];

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 flex h-[64px] items-center justify-between bg-surface px-6 md:hidden rounded-t-[24px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        if (item.isAction) {
          return (
            <div key="post" className="relative flex flex-col items-center justify-center h-full w-[20%]">
              <button
                type="button"
                onClick={() => router.push(isLoggedIn ? appRoutes.compose : appRoutes.login)}
                className="absolute -top-5 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-brand text-white shadow-lg transition active:scale-95 border-4 border-surface"
                aria-label="Post"
              >
                <Plus className="h-6 w-6" strokeWidth={2.5} />
              </button>
              <span className="text-[10px] text-muted-foreground font-medium mt-auto mb-1">
                {item.label}
              </span>
            </div>
          );
        }

        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center justify-center h-full w-[20%] gap-[2px]"
          >
            <div className="relative">
              <Icon
                className={cn(
                  "h-[22px] w-[22px] transition-colors",
                  isActive ? "text-brand" : "text-muted-foreground"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.badge && (
                <div className="absolute right-0 top-0 h-[8px] w-[8px] rounded-full bg-danger border border-surface transform translate-x-[2px] -translate-y-[2px]" />
              )}
            </div>
            <span
              className={cn(
                "text-[10px]",
                isActive ? "text-brand font-semibold" : "text-muted-foreground font-medium"
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
