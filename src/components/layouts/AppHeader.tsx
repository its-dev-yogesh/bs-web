"use client";

import Link from "next/link";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Button } from "@/components/ui/button/Button";
import { Dot } from "@/components/ui/badge/Badge";
import { Icon } from "@/components/icons/icons";
import { useLogout } from "@/hooks/mutations/useLogout";
import { siteConfig } from "@/config/site";
import { appRoutes } from "@/config/routes/app.routes";

export function AppHeader() {
  const user = useAppStore(selectUser);
  const { mutate: logout, isPending } = useLogout();

  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 md:gap-4 md:px-6">
        {user ? (
          <Link
            href={appRoutes.me}
            className="shrink-0 md:hidden"
            aria-label="My profile"
          >
            <Avatar
              src={user.avatarUrl}
              name={user.name ?? user.username}
              size="sm"
            />
          </Link>
        ) : null}

        <Link
          href={appRoutes.home}
          className="hidden text-lg font-bold tracking-tight text-brand md:block"
        >
          {siteConfig.name}
        </Link>

        <label className="flex flex-1 items-center gap-2 rounded-md bg-surface-muted px-3 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-brand/40">
          <Icon name="search" width={18} height={18} />
          <input
            type="search"
            placeholder="Search"
            className="h-9 w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        <Link
          href={appRoutes.messages}
          aria-label="Messages"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
        >
          <Icon name="message" width={22} height={22} />
          <Dot className="absolute right-2 top-2" />
        </Link>

        {user ? (
          <Link
            href={appRoutes.me}
            aria-label="My profile"
            className="hidden shrink-0 md:inline-flex"
          >
            <Avatar
              src={user.avatarUrl}
              name={user.name ?? user.username}
              size="sm"
            />
          </Link>
        ) : null}

        {user ? (
          <Button
            size="sm"
            variant="ghost"
            loading={isPending}
            onClick={() => logout()}
            className="hidden md:inline-flex"
          >
            Sign out
          </Button>
        ) : (
          <Link href={appRoutes.login} className="hidden md:inline-flex">
            <Button size="sm">Sign in</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
