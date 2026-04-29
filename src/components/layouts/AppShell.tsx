"use client";

import { Suspense, type ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { useCurrentUser } from "@/hooks/queries/useCurrentUser";

export function AppShell({ children }: { children: ReactNode }) {
  useCurrentUser();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-[1128px] flex-1">
        <main className="flex-1 w-full">
          <div className="pb-24 md:pb-10 pt-4">
            {children}
          </div>
        </main>
      </div>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
