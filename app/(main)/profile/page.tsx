"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/main.store";
import { selectUser, selectIsHydrated } from "@/store/selectors/auth.selectors";
import { appRoutes } from "@/config/routes/app.routes";

/** Redirects `/profile` → `/profile/:yourUsername` when logged in. */
export default function MyProfileEntryPage() {
  const router = useRouter();
  const user = useAppStore(selectUser);
  const isHydrated = useAppStore(selectIsHydrated);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace(appRoutes.login);
      return;
    }
    // chanakya-astra users don't always have a username — fall back to _id,
    // which the /profile/[username] route resolves via getById.
    const slug = user.username ?? user._id ?? user.id;
    if (!slug) {
      router.replace(appRoutes.login);
      return;
    }
    router.replace(appRoutes.profile(String(slug)));
  }, [router, isHydrated, user]);

  return (
    <p className="text-sm text-muted-foreground text-center py-12 px-4">
      Opening your profile…
    </p>
  );
}
