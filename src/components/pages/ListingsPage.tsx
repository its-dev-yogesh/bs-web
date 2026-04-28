"use client";

import Link from "next/link";
import { useListings, useSavedPosts } from "@/hooks/queries/useListings";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { Card } from "@/components/ui/card/Card";
import { Icon } from "@/components/icons/icons";
import { ListingCard, ListingCardSkeleton } from "@/components/cards/ListingCard";
import { appRoutes } from "@/config/routes/app.routes";
import type { ReactNode } from "react";
import type { ListingItem } from "@/services/post.service";

export function ListingsPage() {
  const user = useAppStore(selectUser);
  const targetType = user?.type === "agent" ? "requirement" : "listing";
  const sectionLabel =
    targetType === "listing" ? "Recent listings" : "Recent requirements";

  const { data: recent, isLoading: loadingRecent } = useListings({
    type: targetType,
    limit: 12,
  });
  const { data: saved, isLoading: loadingSaved } = useSavedPosts();
  const myUserId = user?._id ?? user?.id;
  const { data: mine, isLoading: loadingMine } = useListings({
    user_id: myUserId,
    limit: 6,
  });

  return (
    <div className="flex flex-col gap-3">
      <Link href={`${appRoutes.listings}/me`} className="block">
        <Card className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-soft text-brand">
            <Icon name="briefcase" width={20} height={20} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              My posts
            </p>
            <p className="text-xs text-muted-foreground">
              {loadingMine
                ? "Loading…"
                : `${mine?.length ?? 0} active`}
            </p>
          </div>
          <Icon
            name="more"
            width={20}
            height={20}
            className="text-muted-foreground"
          />
        </Card>
      </Link>

      <Section title={sectionLabel}>
        {loadingRecent ? (
          <SectionSkeletons />
        ) : (recent?.length ?? 0) === 0 ? (
          <EmptyState label={`No ${targetType}s yet.`} />
        ) : (
          <ListingList items={recent ?? []} />
        )}
      </Section>

      <Section title="Saved">
        {loadingSaved ? (
          <SectionSkeletons />
        ) : (saved?.length ?? 0) === 0 ? (
          <EmptyState label="Bookmarked posts will appear here." />
        ) : (
          <ListingList items={saved ?? []} />
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <button className="text-xs font-medium text-brand">See all</button>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function SectionSkeletons() {
  return (
    <>
      <ListingCardSkeleton />
      <ListingCardSkeleton />
      <ListingCardSkeleton />
    </>
  );
}

function ListingList({ items }: { items: ListingItem[] }) {
  return (
    <>
      {items.map((item) => (
        <ListingCard key={item.id} item={item} />
      ))}
    </>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
      {label}
    </Card>
  );
}
