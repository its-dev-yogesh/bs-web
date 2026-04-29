"use client";

import { useEffect, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRouter } from "next/navigation";
import { getQueryClient } from "@/lib/query-client";
import { setUnauthorizedHandler } from "@/lib/axios";
import { authActions } from "@/store/actions/auth.actions";
import { appRoutes } from "@/config/routes/app.routes";
import { ToastContainer } from "@/components/feedback/ToastContainer";

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const router = useRouter();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      authActions.signOut();
      router.replace(appRoutes.login);
    });
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer />
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
