import { Suspense, type ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <AppSidebar />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-3 pb-24 pt-3 md:px-6 md:pb-10 md:pt-6">
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
