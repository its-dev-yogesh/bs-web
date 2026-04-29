"use client";

import { Users, UserPlus, Calendar, Building, Newspaper } from "lucide-react";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Card } from "@/components/ui/card/Card";
import { useSuggestedUsers } from "@/hooks/queries/useSuggestedUsers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { connectionService } from "@/services/connection.service";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/config/routes/app.routes";
import { FollowOrConnectButton } from "@/components/connect/FollowOrConnectButton";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";
import { getStoredStories, getStoredStoriesByUserId, type Story } from "@/lib/stories";
import { StoryOverlay } from "@/components/sections/StoryOverlay";

const SECTION_CONNECTIONS = "network-my-connections";
const SECTION_SUGGESTIONS = "network-suggestions";

export function NetworkPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAppStore(selectUser);
  const isLoggedIn = Boolean(user?._id ?? user?.id);
  const { data: realSuggestedUsers, isLoading } = useSuggestedUsers(12);
  const { data: myConnections } = useQuery({
    queryKey: queryKeys.connections.list(),
    queryFn: () => connectionService.list(),
    enabled: isLoggedIn,
    staleTime: 0,
  });
  const totalConnections = myConnections?.total ?? myConnections?.items?.length ?? 0;
  const totalSuggestions = realSuggestedUsers?.length ?? 0;

  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [viewerStories, setViewerStories] = useState<Story[]>([]);

  const scrollToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  type SidebarAction =
    | { kind: "scroll"; targetId: string }
    | { kind: "href"; href: string };

  const sidebarItems: {
    icon: typeof Users;
    label: string;
    count: string;
    action: SidebarAction;
  }[] = [
    {
      icon: Users,
      label: "My Network",
      count: String(totalConnections),
      action: { kind: "scroll", targetId: SECTION_CONNECTIONS },
    },
    {
      icon: UserPlus,
      label: "Suggestions",
      count: String(totalSuggestions),
      action: { kind: "scroll", targetId: SECTION_SUGGESTIONS },
    },
    {
      icon: Building,
      label: "Broker Firms",
      count: "→",
      action: { kind: "href", href: appRoutes.listings },
    },
    {
      icon: Calendar,
      label: "Open Houses",
      count: "→",
      action: { kind: "href", href: appRoutes.listings },
    },
    {
      icon: Newspaper,
      label: "Local News",
      count: "→",
      action: { kind: "href", href: appRoutes.notifications },
    },
  ];

  interface SuggestedUser {
    id?: string;
    _id?: string;
    name?: string;
    username?: string;
    headline?: string;
    avatarUrl?: string;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 px-4 md:px-0">
      {/* Left Sidebar */}
      <aside className="w-full md:w-[280px] shrink-0">
        <Card className="p-4 rounded-xl shadow-sm border-surface-border/50 bg-surface">
          <h2 className="font-bold text-[16px] text-foreground mb-4">Manage broker network</h2>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.action.kind === "scroll") {
                    scrollToSection(item.action.targetId);
                  } else {
                    router.push(item.action.href);
                  }
                }}
                className="flex items-center justify-between w-full p-2 hover:bg-surface-muted rounded-lg text-muted-foreground hover:text-foreground transition text-[14px] font-semibold text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon className="w-5 h-5 shrink-0 text-gray-500" />
                  <span className="truncate">{item.label}</span>
                </div>
                <span
                  className={cn(
                    "text-[12px] font-medium shrink-0 tabular-nums",
                    item.action.kind === "href" ? "text-brand" : "text-gray-500",
                  )}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </nav>
        </Card>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-4">
        {/* Connections Section */}
        <Card
          id={SECTION_CONNECTIONS}
          className="rounded-xl border border-surface-border/50 shadow-sm overflow-hidden bg-surface scroll-mt-24"
        >
          <div className="flex justify-between items-center p-4 border-b border-surface-border/50">
            <h3 className="font-bold text-[16px] text-foreground">My connections</h3>
            <button
              type="button"
              onClick={() =>
                qc.invalidateQueries({ queryKey: queryKeys.connections.all })
              }
              className="text-brand hover:underline font-bold text-[14px]"
            >
              Refresh
            </button>
          </div>

          <div className="divide-y divide-surface-border/50">
            {(myConnections?.items ?? []).slice(0, 8).map((c) => (
              <ConnectionRow
                key={String(c.id ?? c._id)}
                userId={String(c.id ?? c._id).trim() || undefined}
                username={c.username ?? "broker"}
                name={c.name ?? c.username ?? "Broker"}
                role={c.headline ?? "Broker"}
                avatar={c.avatarUrl ?? `https://i.pravatar.cc/150?u=${encodeURIComponent(c.username ?? "")}`}
                onStoryClick={(stories) => {
                  setViewerStories(stories);
                  setStoryViewerOpen(true);
                }}
              />
            ))}
            {!isLoggedIn ? (
              <p className="p-4 text-sm text-muted-foreground">
                <Link href={appRoutes.login} className="font-semibold text-brand hover:underline">
                  Sign in
                </Link>{" "}
                to see your connections.
              </p>
            ) : (myConnections?.items?.length ?? 0) === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No accepted connections yet. Send requests from here or the feed—each broker must accept before
                they show up in this list.
              </p>
            ) : null}
          </div>
        </Card>

        {/* Suggestions Section */}
        <Card
          id={SECTION_SUGGESTIONS}
          className="p-4 rounded-xl border border-surface-border/50 shadow-sm bg-surface scroll-mt-24"
        >
          <h3 className="font-bold text-[16px] text-foreground mb-4">Brokers you may know</h3>

          {isLoading ? (
            <p className="text-center text-muted-foreground text-sm py-4">Loading brokers…</p>
          ) : realSuggestedUsers && realSuggestedUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {realSuggestedUsers.map((u: SuggestedUser, idx: number) => (
                <SuggestionGridItem
                  key={String(u.id ?? u._id ?? idx)}
                  userId={String(u.id ?? u._id ?? "").trim() || undefined}
                  username={u.username ?? `broker_${idx}`}
                  name={u.name ?? u.username ?? "Broker"}
                  role={u.headline ?? "Real Estate Broker"}
                  avatar={u.avatarUrl ?? `https://i.pravatar.cc/150?u=${idx}`}
                  mutuals={idx + 2}
                  isLoggedIn={isLoggedIn}
                  onStoryClick={(stories) => {
                    setViewerStories(stories);
                    setStoryViewerOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-4">No broker suggestions available.</p>
          )}
        </Card>
      </div>
      {storyViewerOpen && viewerStories.length > 0 ? (
        <StoryOverlay
          stories={viewerStories}
          index={0}
          isOwnStory={false}
          onClose={() => setStoryViewerOpen(false)}
          onPrev={() => {}}
          onNext={() => {}}
          onViewProfile={() => {}}
          onMessage={() => {}}
          onDelete={() => {}}
        />
      ) : null}
    </div>
  );
}

function ConnectionRow({
  username,
  name,
  role,
  avatar,
  userId,
  onStoryClick,
}: {
  username: string;
  name: string;
  role: string;
  avatar: string;
  userId?: string;
  onStoryClick?: (stories: Story[]) => void;
}) {
  const [hasStory, setHasStory] = useState(false);

  useEffect(() => {
    if (!userId || !userId.trim()) {
      setHasStory(false);
      return;
    }
    let stories = getStoredStoriesByUserId(userId);
    // Fallback: try matching by username if userId doesn't find anything
    if (!stories || stories.length === 0) {
      const allStories = getStoredStories();
      stories = allStories.filter(s => s.username === username);
    }
    const hasValidStory = stories && stories.length > 0;
    setHasStory(hasValidStory);
  }, [userId, username]);

  return (
    <div className="flex items-center justify-between p-4 flex-wrap gap-3">
      {hasStory && onStoryClick ? (
        <button
          type="button"
          onClick={() => {
            let stories = getStoredStoriesByUserId(userId || "");
            // Fallback: try matching by username
            if (!stories || stories.length === 0) {
              const allStories = getStoredStories();
              stories = allStories.filter(s => s.username === username);
            }
            onStoryClick(stories);
          }}
          className="flex items-center gap-3 min-w-0 hover:opacity-90"
        >
          <span className="rounded-full p-0.5 bg-linear-to-tr from-pink-500 via-fuchsia-500 to-amber-400">
            <Avatar src={avatar} name={name} size="md" className="ring-2 ring-surface" />
          </span>
          <div className="min-w-0">
            <h4 className="font-bold text-[14px] text-foreground truncate">{name}</h4>
            <p className="text-[12px] text-muted-foreground truncate">{role}</p>
          </div>
        </button>
      ) : (
        <Link href={appRoutes.profile(username)} className="flex items-center gap-3 min-w-0 hover:opacity-90">
          {hasStory ? (
            <span className="rounded-full p-0.5 bg-linear-to-tr from-pink-500 via-fuchsia-500 to-amber-400">
              <Avatar src={avatar} name={name} size="md" className="ring-2 ring-surface" />
            </span>
          ) : (
            <Avatar src={avatar} name={name} size="md" />
          )}
          <div className="min-w-0">
            <h4 className="font-bold text-[14px] text-foreground truncate">{name}</h4>
            <p className="text-[12px] text-muted-foreground truncate">{role}</p>
          </div>
        </Link>
      )}
      <Link
        href={appRoutes.profile(username)}
        className="px-4 py-1.5 rounded-full text-[13px] font-bold border border-surface-border text-muted-foreground hover:bg-surface-muted transition shrink-0"
      >
        View profile
      </Link>
    </div>
  );
}

function SuggestionGridItem({
  userId,
  username,
  name,
  role,
  avatar,
  mutuals,
  isLoggedIn,
  onStoryClick,
}: {
  userId?: string;
  username: string;
  name: string;
  role: string;
  avatar: string;
  mutuals: number;
  isLoggedIn: boolean;
  onStoryClick?: (stories: Story[]) => void;
}) {
  const [hasStory, setHasStory] = useState(false);

  useEffect(() => {
    if (!userId || !userId.trim()) {
      setHasStory(false);
      return;
    }
    let stories = getStoredStoriesByUserId(userId);
    // Fallback: try matching by username if userId doesn't find anything
    if (!stories || stories.length === 0) {
      const allStories = getStoredStories();
      stories = allStories.filter(s => s.username === username);
    }
    const hasValidStory = stories && stories.length > 0;
    setHasStory(hasValidStory);
  }, [userId, username]);

  return (
    <div className="bg-surface border border-surface-border/50 rounded-xl overflow-hidden flex flex-col items-center text-center pb-4 hover:shadow-md transition">
      <div className="h-14 w-full bg-gradient-to-r from-blue-400 to-sky-400" />
      <div className="-mt-8">
        {hasStory && onStoryClick ? (
          <button
            type="button"
            onClick={() => {
              let stories = getStoredStoriesByUserId(userId || "");
              // Fallback: try matching by username
              if (!stories || stories.length === 0) {
                const allStories = getStoredStories();
                stories = allStories.filter(s => s.username === username);
              }
              onStoryClick(stories);
            }}
            className="rounded-full p-0.5 bg-linear-to-tr from-pink-500 via-fuchsia-500 to-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Avatar
              src={avatar}
              name={name}
              size="lg"
              className="ring-2 ring-surface"
            />
          </button>
        ) : (
          <Link href={appRoutes.profile(username)}>
            {hasStory ? (
              <span className="rounded-full p-0.5 bg-linear-to-tr from-pink-500 via-fuchsia-500 to-amber-400">
                <Avatar
                  src={avatar}
                  name={name}
                  size="lg"
                  className="ring-2 ring-surface"
                />
              </span>
            ) : (
              <Avatar src={avatar} name={name} size="lg" className="ring-4 ring-surface" />
            )}
          </Link>
        )}
      </div>
      <div className="px-3 mt-3 flex-1 flex flex-col min-h-[90px]">
        <Link href={appRoutes.profile(username)} className="font-bold text-[15px] text-foreground hover:underline">
          {name}
        </Link>
        <p className="text-[12px] text-muted-foreground line-clamp-2 mt-1">{role}</p>
        <p className="text-[11px] text-gray-400 font-medium mt-auto mb-2">
          {mutuals > 0 ? `${mutuals} mutual connections` : "No mutual connections"}
        </p>
      </div>
      {isLoggedIn ? (
        <FollowOrConnectButton
          targetUserId={userId}
          variant="primary"
          label="Connect"
          className="w-[85%] py-1.5 rounded-full text-[13px] mt-2"
        />
      ) : (
        <Link
          href={appRoutes.login}
          className="w-[85%] py-1.5 rounded-full border border-brand text-brand font-bold text-[13px] hover:bg-brand-soft transition mt-2 text-center"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
