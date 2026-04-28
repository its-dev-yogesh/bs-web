import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
