"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { appRoutes } from "@/config/routes/app.routes";

/** Redirects `/profile` → `/profile/:yourUsername` when logged in. */
export default function MyProfileEntryPage() {
  const router = useRouter();
  const user = useAppStore(selectUser);

  useEffect(() => {
    if (!user?.username) {
      router.replace(appRoutes.login);
      return;
    }
    router.replace(appRoutes.profile(user.username));
  }, [router, user?.username]);

  return (
    <p className="text-sm text-muted-foreground text-center py-12 px-4">
      Opening your profile…
    </p>
  );
}
