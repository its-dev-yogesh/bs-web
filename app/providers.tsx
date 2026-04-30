"use client";

import { useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { setUnauthorizedHandler } from "@/lib/axios";
import { authActions } from "@/store/actions/auth.actions";
import { appRoutes } from "@/config/routes/app.routes";
import { useNotificationsSocket } from "@/hooks/realtime/useNotificationsSocket";

function RealtimeBridge() {
  useNotificationsSocket();
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      authActions.signOut();
      if (typeof window !== "undefined") {
        window.location.replace(appRoutes.login);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => undefined);
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeBridge />
      {children}
    </QueryClientProvider>
  );
}
