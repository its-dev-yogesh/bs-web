"use client";

import { useEffect } from "react";
import { Heart, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { formatStoryRelative, type StoryViewer } from "@/lib/stories";

/** Instagram-style bottom sheet listing the viewers of an own story.
 *  Likers are pinned to the top and tagged with a filled heart. */
export function StoryViewersSheet({
  open,
  onClose,
  viewers,
}: {
  open: boolean;
  onClose: () => void;
  viewers: StoryViewer[];
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Likers first, then by recency.
  const ordered = [...viewers].sort((a, b) => {
    if (Boolean(b.liked) !== Boolean(a.liked)) return b.liked ? 1 : -1;
    return Date.parse(b.viewedAt) - Date.parse(a.viewedAt);
  });
  const totalViews = viewers.length;
  const totalLikes = viewers.filter((v) => v.liked).length;

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close viewers"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60"
      />
      <div className="relative z-10 flex max-h-[70%] w-full flex-col overflow-hidden rounded-t-2xl bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Viewers</h3>
            <p className="text-[11px] text-muted-foreground">
              {totalViews} {totalViews === 1 ? "view" : "views"}
              {totalLikes > 0
                ? ` · ${totalLikes} ${totalLikes === 1 ? "like" : "likes"}`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {ordered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No views yet.
            </p>
          ) : (
            <ul className="divide-y divide-surface-border/60">
              {ordered.map((v) => {
                const display = v.name || v.username || "Broker";
                return (
                  <li
                    key={v.userId}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <Avatar src={v.avatarUrl} name={display} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {display}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {v.username ? `@${v.username} · ` : ""}
                        {formatStoryRelative(v.viewedAt)}
                      </p>
                    </div>
                    {v.liked ? (
                      <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
