"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, MessageSquareMore, Home, Users, Briefcase, Bell, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { appRoutes } from "@/config/routes/app.routes";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { useUnreadCount } from "@/hooks/queries/useNotifications";
import { useLogout } from "@/hooks/mutations/useLogout";
import { Modal } from "@/components/ui/modal/Modal";
import { userService } from "@/services/user.service";
import { queryKeys } from "@/lib/query-keys";

import { Logo } from "@/components/common/Logo";

export function AppHeader() {
  const pathname = usePathname();
  const user = useAppStore(selectUser);
  const isLoggedIn = Boolean(user?._id ?? user?.id);
  const { data: unreadCount } = useUnreadCount({ enabled: isLoggedIn });
  const logout = useLogout();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const handleLogout = () => {
    if (logout.isPending) return;
    setLogoutConfirmOpen(true);
  };

  const browseNavItems = [
    { label: "Home", href: appRoutes.home, icon: Home },
    { label: "Brokers", href: appRoutes.network, icon: Users },
    { label: "Listings", href: appRoutes.listings, icon: Briefcase },
  ] as const;

  const accountNavItems = [
    { label: "Messaging", href: appRoutes.messages, icon: MessageSquareMore },
    { label: "Notifications", href: appRoutes.notifications, icon: Bell },
  ] as const;

  function DesktopNavLink({
    item,
    showUnreadBadge,
  }: {
    item: {
      readonly label: string;
      readonly href: string;
      readonly icon: typeof Home;
    };
    showUnreadBadge?: boolean;
  }) {
    const isActive =
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.label}
        href={item.href}
        className="relative flex flex-col items-center justify-center h-full px-4 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <div className="relative">
          <Icon
            className={cn(
              "h-[22px] w-[22px]",
              isActive ? "text-foreground" : "text-muted-foreground",
            )}
            strokeWidth={1.5}
          />
          {showUnreadBadge && (unreadCount ?? 0) > 0 && (
            <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-danger border border-surface" />
          )}
        </div>
        <span
          className={cn(
            "text-[12px] mt-1 hidden md:block",
            isActive ? "text-foreground font-semibold" : "text-muted-foreground",
          )}
        >
          {item.label}
        </span>
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
        )}
      </Link>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-surface-border/50 shadow-sm pt-1 pb-1">
      <div className="mx-auto flex h-[52px] max-w-6xl items-center justify-between px-4 md:px-6 gap-3">
        
        {/* Left Section: Logo & Search */}
        <div className="flex items-center gap-3 flex-1 md:flex-initial">
          {/* Mobile Avatar */}
          {isLoggedIn ? (
            <Link href={appRoutes.profile(user?.username ?? "")} className="shrink-0 md:hidden">
              <Avatar
                src={user?.avatarUrl}
                name={user?.name ?? user?.username ?? "Me"}
                size="sm"
                className="w-[34px] h-[34px]"
              />
            </Link>
          ) : (
            <Link
              href={appRoutes.login}
              className="shrink-0 md:hidden rounded-full border border-surface-border px-3 py-1 text-xs font-semibold text-foreground"
            >
              Sign in
            </Link>
          )}

          {/* Desktop Logo */}
          <Link href={appRoutes.home} className="shrink-0 hidden md:block">
            <Logo className="w-8 h-8" />
          </Link>

          <HeaderSearch />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center h-full">
          {browseNavItems.map((item) => (
            <DesktopNavLink key={item.label} item={item} />
          ))}
          {isLoggedIn ? (
            <>
              {accountNavItems.map((item) => (
                <DesktopNavLink
                  key={item.label}
                  item={item}
                  showUnreadBadge={item.label === "Notifications"}
                />
              ))}
              <Link
                href={appRoutes.profile(user?.username ?? "")}
                className="flex flex-col items-center justify-center h-full px-4 ml-4 border-l border-surface-border/50 text-muted-foreground hover:text-foreground"
              >
                <Avatar
                  src={user?.avatarUrl}
                  name={user?.name ?? user?.username ?? "Me"}
                  size="sm"
                  className="w-5 h-5"
                />
                <span className="text-[12px] mt-1 flex items-center gap-1">Me</span>
              </Link>
              <button
                aria-label="Logout"
                title="Logout"
                onClick={handleLogout}
                disabled={logout.isPending}
                className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-surface-muted disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-surface-border/50">
              <Link
                href={appRoutes.login}
                className="rounded-full border border-surface-border px-4 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-muted"
              >
                Sign in
              </Link>
              <Link
                href={appRoutes.register}
                className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-hover"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile View Messaging */}
        {isLoggedIn ? (
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href={appRoutes.messages}
              aria-label="Messages"
              className="relative flex h-[36px] w-[36px] items-center justify-center text-gray-500 hover:bg-surface-muted rounded-full"
            >
              <MessageSquareMore className="w-[24px] h-[24px]" strokeWidth={1.5} />
              {(unreadCount ?? 0) > 0 ? (
                <div className="absolute right-1 top-1 h-[8px] w-[8px] rounded-full bg-danger border border-surface"></div>
              ) : null}
            </Link>
            <button
              aria-label="Logout"
              title="Logout"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-full text-foreground hover:bg-surface-muted disabled:opacity-60"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        ) : (
          <Link
            href={appRoutes.register}
            className="flex md:hidden rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white"
          >
            Sign up
          </Link>
        )}

      </div>
      <Modal
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title="Confirm logout"
        mobilePosition="center"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to logout from Broker Social?
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setLogoutConfirmOpen(false)}
              className="rounded-full border border-surface-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                logout.mutate(undefined, {
                  onSettled: () => setLogoutConfirmOpen(false),
                });
              }}
              disabled={logout.isPending}
              className="rounded-full bg-danger px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {logout.isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
}

type SearchUser = {
  id?: string;
  _id?: string;
  username?: string;
  name?: string;
  avatarUrl?: string;
  headline?: string;
};

function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => window.clearTimeout(t);
  }, [query]);

  const enabled = debouncedQuery.length >= 1;
  const { data: results = [], isFetching } = useQuery({
    queryKey: queryKeys.users.search(debouncedQuery),
    queryFn: () => userService.search(debouncedQuery, 10) as Promise<SearchUser[]>,
    enabled,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, results.length]);

  const goToProfile = (user: SearchUser) => {
    const slug =
      (user.username && user.username.trim()) ||
      String(user._id ?? user.id ?? "").trim();
    if (!slug) return;
    setOpen(false);
    setQuery("");
    router.push(appRoutes.profile(slug));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) goToProfile(target);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 md:flex-initial md:w-[280px]"
    >
      <label className="flex items-center gap-2 rounded bg-[#EDF3F8] px-3 h-[36px] w-full text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-brand/40">
        <Search className="w-4 h-4 text-gray-600" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search brokers"
          className="w-full bg-transparent text-foreground outline-none placeholder:text-gray-600 placeholder:font-normal text-[14px]"
        />
      </label>
      {open && enabled ? (
        <div className="absolute left-0 right-0 top-full mt-1 z-40 max-h-80 overflow-y-auto rounded-xl border border-surface-border bg-surface shadow-lg">
          {isFetching && results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No users match &ldquo;{debouncedQuery}&rdquo;
            </div>
          ) : (
            results.map((u, idx) => {
              const display = u.name?.trim() || u.username || "Broker";
              return (
                <button
                  type="button"
                  key={String(u._id ?? u.id ?? u.username ?? idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goToProfile(u)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left",
                    activeIndex === idx ? "bg-surface-muted" : "hover:bg-surface-muted/60",
                  )}
                >
                  <Avatar src={u.avatarUrl} name={display} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-foreground">
                      {display}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {u.username ? `@${u.username}` : null}
                      {u.headline ? `${u.username ? " · " : ""}${u.headline}` : null}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
