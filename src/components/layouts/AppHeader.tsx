"use client";

import Link from "next/link";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Button } from "@/components/ui/button/Button";
import { useLogout } from "@/hooks/mutations/useLogout";
import { siteConfig } from "@/config/site";
import { appRoutes } from "@/config/routes/app.routes";

export function AppHeader() {
  const user = useAppStore(selectUser);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { mutate: logout, isPending } = useLogout();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="flex items-center gap-3">
        <button
          aria-label="Toggle navigation"
          onClick={toggleSidebar}
          className="rounded-md p-2 hover:bg-gray-100 md:hidden dark:hover:bg-gray-800"
        >
          <span className="block h-0.5 w-5 bg-current" />
        </button>
        <Link href={appRoutes.home} className="text-lg font-bold tracking-tight">
          {siteConfig.name}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link href={appRoutes.profile(user.username)}>
              <Avatar
                src={user.avatarUrl}
                name={user.name ?? user.username}
                size="sm"
              />
            </Link>
            <Button
              size="sm"
              variant="ghost"
              loading={isPending}
              onClick={() => logout()}
            >
              Sign out
            </Button>
          </>
        ) : (
          <Link href={appRoutes.login}>
            <Button size="sm">Sign in</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
