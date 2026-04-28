import { Card } from "@/components/ui/card/Card";

export function PostSkeleton() {
  return (
    <Card className="animate-pulse p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-surface-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded bg-surface-muted" />
          <div className="h-3 w-1/4 rounded bg-surface-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 rounded bg-surface-muted" />
        <div className="h-3 w-5/6 rounded bg-surface-muted" />
      </div>
      <div className="mt-3 h-40 rounded bg-surface-muted" />
    </Card>
  );
}
