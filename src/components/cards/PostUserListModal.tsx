"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/modal/Modal";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { appRoutes } from "@/config/routes/app.routes";
import type { PostUserSummary } from "@/services/post.service";

export function PostUserListModal({
  open,
  onClose,
  title,
  users,
  isLoading,
  emptyText,
  errorText,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  users: PostUserSummary[] | undefined;
  isLoading?: boolean;
  emptyText?: string;
  errorText?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {errorText ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {errorText}
        </p>
      ) : isLoading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      ) : !users || users.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {emptyText ?? "No one yet."}
        </p>
      ) : (
        <ul className="divide-y divide-surface-border/60">
          {users.map((u) => {
            const slug = u.username || u.userId;
            const display = u.name || u.username || "Broker";
            const subline = u.headline || (u.username ? `@${u.username}` : undefined);
            return (
              <li key={u.userId} className="flex items-center gap-3 py-2.5">
                <Avatar src={u.avatarUrl} name={display} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link
                    href={appRoutes.profile(slug)}
                    onClick={onClose}
                    className="block truncate text-sm font-semibold text-foreground hover:underline"
                  >
                    {display}
                  </Link>
                  {subline ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {subline}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
