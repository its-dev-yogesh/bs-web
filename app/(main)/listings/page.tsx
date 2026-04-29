import { Suspense } from "react";
import { ListingsPage } from "@/components/pages/ListingsPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          Loading listings…
        </div>
      }
    >
      <ListingsPage />
    </Suspense>
  );
}
