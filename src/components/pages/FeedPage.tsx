import { Suspense } from "react";
import { FeedSection } from "@/components/sections/FeedSection";

export function FeedPage() {
  return (
    <Suspense fallback={null}>
      <FeedSection />
    </Suspense>
  );
}
