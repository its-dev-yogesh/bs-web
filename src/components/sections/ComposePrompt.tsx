"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Card } from "@/components/ui/card/Card";

export function ComposePrompt() {
  const user = useAppStore(selectUser);
  const router = useRouter();
  const search = useSearchParams();

  const open = () => {
    const params = new URLSearchParams(search?.toString() ?? "");
    params.set("compose", "1");
    router.push(`/?${params.toString()}`);
  };

  return (
    <Card className="px-3 py-3">
      <div className="flex items-center gap-3">
        <Avatar
          src={user?.avatarUrl}
          name={user?.name ?? user?.username}
          size="md"
        />
        <button
          onClick={open}
          className="flex-1 rounded-full border border-surface-border px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-surface-muted"
        >
          Start a post
        </button>
      </div>
    </Card>
  );
}
