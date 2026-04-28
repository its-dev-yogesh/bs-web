"use client";

import { useSuggestedUsers } from "@/hooks/queries/useSuggestedUsers";
import { Card } from "@/components/ui/card/Card";
import { Icon } from "@/components/icons/icons";
import { SuggestionCard } from "@/components/cards/SuggestionCard";

export function NetworkPage() {
  const { data: users, isLoading } = useSuggestedUsers(20);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon="network"
          label="Connections"
          value={0}
        />
        <StatCard
          icon="briefcase"
          label="People"
          value={users?.length ?? 0}
        />
      </div>

      <SectionHeader title="Invitations" badge={0} />
      <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
        No pending invitations.
      </Card>

      <SectionHeader title="People you may know" />
      {isLoading ? (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="h-56 w-44 shrink-0 animate-pulse bg-surface-muted"
            >
              <div className="sr-only">loading</div>
            </Card>
          ))}
        </div>
      ) : (users?.length ?? 0) === 0 ? (
        <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
          No suggestions right now.
        </Card>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(users ?? []).map((u, i) => (
            <SuggestionCard
              key={u._id ?? u.id ?? u.username}
              user={u}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: "network" | "briefcase";
  label: string;
  value: number;
}) {
  return (
    <Card className="flex items-center gap-3 px-3 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-soft text-brand">
        <Icon name={icon} width={18} height={18} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
    </Card>
  );
}

function SectionHeader({ title, badge }: { title: string; badge?: number }) {
  return (
    <div className="flex items-center justify-between px-1 pt-2">
      <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
        {title}
        {typeof badge === "number" && badge > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-semibold text-white">
            {badge}
          </span>
        ) : null}
      </h2>
      <button className="text-xs font-medium text-brand">See all</button>
    </div>
  );
}
