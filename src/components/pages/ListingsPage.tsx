"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Briefcase, ChevronRight, Bookmark, MapPin, Megaphone } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card/Card";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useListings, useSavedPosts } from "@/hooks/queries/useListings";
import { formatRelative } from "@/lib/date";
import { useLeads } from "@/hooks/queries/useLeads";
import { appRoutes } from "@/config/routes/app.routes";
import { cn } from "@/lib/cn";
import { postService } from "@/services/post.service";
import type { ListingItem } from "@/services/post.service";
import { queryKeys } from "@/lib/query-keys";
import { uiActions } from "@/store/actions/ui.actions";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { useRouter } from "next/navigation";

export function ListingsPage() {
  const router = useRouter();
  const user = useAppStore(selectUser);
  const isLoggedIn = Boolean(user?._id ?? user?.id);
  const qc = useQueryClient();
  const { mutate: toggleSaved, isPending: togglingSaved } = useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
      saved ? postService.unsave(id) : postService.save(id),
    onSuccess: (_data, vars) => {
      uiActions.success(vars.saved ? "Removed from saved" : "Saved");
      qc.invalidateQueries({ queryKey: ["saved-posts"] });
      qc.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
    onError: (err: Error) => {
      uiActions.error("Couldn't update saved item", err.message);
    },
  });

  const search = useSearchParams();
  const tab = search?.get("tab");
  const showSavedOnly = tab === "saved";
  const { data: listings, isLoading: loadingRecent } = useListings({
    type: "listing",
    limit: 20,
  });

  const { data: requirements, isLoading: loadingReq } = useListings({
    type: "requirement",
    limit: 20,
  });
  const { data: savedPosts, isLoading: loadingSaved } = useSavedPosts();
  const { data: leads, isLoading: loadingLeads } = useLeads();
  const savedIds = new Set((savedPosts ?? []).map((p) => p.id));

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-20 max-w-[800px] mx-auto">
      <Link href={appRoutes.home}>
        <Card className="flex items-center gap-4 px-4 py-3 rounded-xl shadow-sm border-surface-border bg-surface transition hover:border-brand/30">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
            <Briefcase className="w-5 h-5 text-brand" strokeWidth={2.5} />
          </span>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-brand">Browse the home feed</p>
            <p className="text-[12px] text-muted-foreground font-medium">
              Listings and requirements from your network
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Card>
      </Link>

      <div className="mt-2 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link
            href={appRoutes.listings}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              !showSavedOnly
                ? "border-brand bg-brand-soft text-brand"
                : "border-surface-border text-muted-foreground hover:bg-surface-muted",
            )}
          >
            Explore
          </Link>
          <Link
            href={`${appRoutes.listings}?tab=saved`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              showSavedOnly
                ? "border-brand bg-brand-soft text-brand"
                : "border-surface-border text-muted-foreground hover:bg-surface-muted",
            )}
          >
            Saved
          </Link>
        </div>
      </div>

      {showSavedOnly ? (
        <div className="mt-2 flex flex-col gap-3">
          <SectionHeader
            title="My saved items"
            subtitle="Posts you bookmarked for follow-up"
          />
          {loadingSaved ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              Loading saved posts…
            </p>
          ) : (savedPosts?.length ?? 0) > 0 ? (
            (savedPosts ?? []).map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                variant={item.type === "requirement" ? "requirement" : "listing"}
                onToggleSaved={() => toggleSaved({ id: item.id, saved: item.saved })}
                togglingSaved={togglingSaved}
              />
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              No saved posts yet.
            </p>
          )}
        </div>
      ) : (
        <>
      <div className="mt-2 flex flex-col gap-3">
        <SectionHeader title="Property listings" subtitle="Broker-listed homes & plots" />

        {loadingRecent ? (
          <p className="text-center text-sm text-muted-foreground py-4">Loading listings…</p>
        ) : listings && listings.length > 0 ? (
          listings.map((item) => (
            <ListingCard
              key={item.id}
              item={{ ...item, saved: savedIds.has(item.id) }}
              variant="listing"
              onToggleSaved={() => {
                if (!isLoggedIn) {
                  router.push(appRoutes.login);
                  return;
                }
                toggleSaved({ id: item.id, saved: savedIds.has(item.id) });
              }}
              togglingSaved={togglingSaved}
            />
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">No listings yet.</p>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <SectionHeader title="Client requirements" subtitle="Buyers & renters looking for property" />

        {loadingReq ? (
          <p className="text-center text-sm text-muted-foreground py-4">Loading requirements…</p>
        ) : requirements && requirements.length > 0 ? (
          requirements.map((item) => (
            <ListingCard
              key={item.id}
              item={{ ...item, saved: savedIds.has(item.id) }}
              variant="requirement"
              onToggleSaved={() => {
                if (!isLoggedIn) {
                  router.push(appRoutes.login);
                  return;
                }
                toggleSaved({ id: item.id, saved: savedIds.has(item.id) });
              }}
              togglingSaved={togglingSaved}
            />
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">No requirements yet.</p>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <SectionHeader title="Lead inbox" subtitle="Interest captured from your posts" />
        {loadingLeads ? (
          <p className="text-center text-sm text-muted-foreground py-4">Loading leads…</p>
        ) : (leads?.length ?? 0) === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">No leads yet.</p>
        ) : (
          (leads ?? []).slice(0, 12).map((lead) => (
            <Card
              key={lead._id}
              className="p-4 rounded-[16px] shadow-sm border-surface-border bg-surface"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[14px] font-bold text-foreground">
                    Lead #{lead._id.slice(0, 8)}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Status:{" "}
                    <span className="font-semibold text-brand">{lead.status}</span>
                  </p>
                </div>
                {lead.post_id ? (
                  <Link
                    href={appRoutes.listingDetail(lead.post_id)}
                    className="text-[12px] font-bold text-brand hover:underline shrink-0"
                  >
                    View post →
                  </Link>
                ) : null}
              </div>
            </Card>
          ))
        )}
      </div>
        </>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 pt-1">
      <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
      {subtitle ? (
        <p className="text-[12px] text-muted-foreground font-medium">{subtitle}</p>
      ) : null}
    </div>
  );
}

function ListingCard({
  item,
  variant,
  onToggleSaved,
  togglingSaved,
}: {
  item: ListingItem;
  variant: "listing" | "requirement";
  onToggleSaved: () => void;
  togglingSaved: boolean;
}) {
  const title = item.title || item.content.slice(0, 120) || "Untitled post";
  const authorLabel =
    item.author?.name ?? item.author?.username ?? "Broker";
  const location =
    item.locationText ??
    (variant === "requirement" ? "Preferred area not set" : "Location not set");

  return (
    <Link href={appRoutes.listingDetail(item.id)} className="block">
      <Card
        className={cn(
          "flex items-start gap-4 p-4 rounded-[16px] shadow-sm border-surface-border bg-surface",
          "transition hover:border-brand/35 hover:shadow-md cursor-pointer",
        )}
      >
        <Avatar
          src={item.author?.avatarUrl}
          name={authorLabel}
          size="lg"
          className="!h-[42px] !w-[42px] shrink-0"
        />

        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide mb-1",
              variant === "listing"
                ? "bg-emerald-600/15 text-emerald-800"
                : "bg-violet-600/15 text-violet-800",
            )}
          >
            {variant === "listing" ? (
              <>
                <Briefcase className="inline h-3 w-3 mr-1 align-middle" />
                Listing
              </>
            ) : (
              <>
                <Megaphone className="inline h-3 w-3 mr-1 align-middle" />
                Requirement
              </>
            )}
          </span>
          <p className="text-[14px] font-bold text-foreground leading-tight line-clamp-2">{title}</p>
          <p className="text-[12px] text-muted-foreground font-medium mt-0.5 truncate">
            {authorLabel}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-[10px] h-[10px] text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground font-medium truncate">{location}</span>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between shrink-0 gap-3">
          <button
            type="button"
            aria-label={item.saved ? "Remove from saved" : "Save post"}
            disabled={togglingSaved}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSaved();
            }}
            className="rounded-full p-1 hover:bg-surface-muted disabled:opacity-60"
          >
            <Bookmark
              className={cn(
                "w-5 h-5",
                item.saved ? "text-brand fill-brand" : "text-muted-foreground",
              )}
              strokeWidth={item.saved ? 1 : 1.5}
            />
          </button>
          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
            {formatRelative(item.createdAt)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
