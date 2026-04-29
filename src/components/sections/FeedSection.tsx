"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFeed } from "@/hooks/queries/useFeed";
import { useIntersection } from "@/hooks/useIntersection";
import { PostCard } from "@/components/cards/PostCard";
import { PostSkeleton } from "@/components/skeletons/PostSkeleton";
import { PostComposerForm } from "@/components/forms/PostComposerForm";
import { Modal } from "@/components/ui/modal/Modal";
import { Button } from "@/components/ui/button/Button";
import { ConnectionsRail } from "./ConnectionsRail";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Image as ImageIcon, FileText, Calendar, Video, Bookmark } from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/config/routes/app.routes";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { useSuggestedUsers } from "@/hooks/queries/useSuggestedUsers";
import { FollowOrConnectButton } from "@/components/connect/FollowOrConnectButton";
import { useSavedPosts, useListings } from "@/hooks/queries/useListings";
import { useQuery } from "@tanstack/react-query";
import { connectionService } from "@/services/connection.service";
import { queryKeys } from "@/lib/query-keys";

export function FeedSection() {
  const user = useAppStore(selectUser);
  const myId = String(user?._id ?? user?.id ?? "");
  const isLoggedIn = Boolean(user?._id ?? user?.id);
  const { data: suggested } = useSuggestedUsers(3);
  const { data: savedItems = [] } = useSavedPosts();
  const { data: myPosts = [] } = useListings({
    user_id: myId || undefined,
    limit: 50,
    status: "active",
  });
  const { data: myConnections } = useQuery({
    queryKey: queryKeys.connections.list(),
    queryFn: () => connectionService.list(),
    enabled: isLoggedIn,
  });
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFeed();
  const { ref, isIntersecting } = useIntersection<HTMLDivElement>();

  const router = useRouter();
  const search = useSearchParams();
  const composeOpen = search?.get("compose") === "1";

  const closeCompose = useCallback(() => {
    const params = new URLSearchParams(search?.toString() ?? "");
    params.delete("compose");
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/");
  }, [router, search]);

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!isLoggedIn && composeOpen) {
      closeCompose();
    }
  }, [isLoggedIn, composeOpen, closeCompose]);

  const openCompose = () => {
    if (!isLoggedIn) {
      router.push(appRoutes.login);
      return;
    }
    const params = new URLSearchParams(search?.toString() ?? "");
    params.set("compose", "1");
    router.push(`/?${params.toString()}`);
  };

  const profileViewerCount =
    myConnections?.total ?? myConnections?.items?.length ?? 0;
  const propertyReachCount = myPosts.length;
  const savedCount = savedItems.length;

  return (
    <div className="flex flex-col md:flex-row gap-6 px-4 md:px-0">
      
      {/* LEFT RAIL - Profile Card (signed-in) or browse CTA (guest) */}
      <aside className="hidden md:block w-[225px] shrink-0 space-y-2">
        {isLoggedIn ? (
          <div className="bg-surface rounded-xl overflow-hidden border border-surface-border/50 shadow-sm">
            <div className="h-14 bg-gradient-to-r from-blue-400 to-indigo-500" />
            <div className="flex flex-col items-center px-4 pb-4 -mt-8 text-center border-b border-surface-border/50">
              <Avatar src={user?.avatarUrl} name={user?.name ?? user?.username} size="lg" className="ring-4 ring-surface" />
              <Link href="/profile" className="mt-3 font-bold text-[16px] text-foreground hover:underline">
                {user?.name ?? user?.username ?? "Your profile"}
              </Link>
              <p className="text-[12px] text-muted-foreground mt-1 font-medium">
                {user?.headline ?? "Broker profile"}
              </p>
            </div>

            <div className="p-3 text-[12px] font-semibold text-muted-foreground border-b border-surface-border/50 space-y-2">
              <button
                type="button"
                onClick={() => router.push(appRoutes.network)}
                className="flex w-full justify-between hover:bg-surface-muted p-1 rounded cursor-pointer text-left"
              >
                <span>Profile viewers</span>
                <span className="text-brand">{profileViewerCount}</span>
              </button>
              <button
                type="button"
                onClick={() => router.push(appRoutes.listings)}
                className="flex w-full justify-between hover:bg-surface-muted p-1 rounded cursor-pointer text-left"
              >
                <span>Property reach</span>
                <span className="text-brand">{propertyReachCount}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => router.push(`${appRoutes.listings}?tab=saved`)}
              className="w-full p-3 text-[12px] font-bold text-foreground hover:bg-surface-muted rounded-b-xl flex items-center justify-between gap-2 cursor-pointer"
            >
              <span className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-muted-foreground" />
              <span>My items</span>
              </span>
              <span className="text-brand">{savedCount}</span>
            </button>
          </div>
        ) : (
          <div className="bg-surface rounded-xl overflow-hidden border border-surface-border/50 shadow-sm p-4 text-center space-y-3">
            <p className="text-[13px] font-semibold text-foreground">Browsing Broker Social</p>
            <p className="text-[12px] text-muted-foreground leading-snug">
              You can explore posts, brokers, and stories. Sign in to post, message, or connect.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href={appRoutes.login}
                className="rounded-full border border-surface-border px-3 py-2 text-[12px] font-bold text-foreground hover:bg-surface-muted"
              >
                Sign in
              </Link>
              <Link
                href={appRoutes.register}
                className="rounded-full bg-brand px-3 py-2 text-[12px] font-bold text-white hover:bg-brand-hover"
              >
                Create account
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* MIDDLE - Feed */}
      <div className="flex-1 max-w-[555px] space-y-4">
        {/* Start a Post box */}
        <div className="bg-surface rounded-xl p-4 border border-surface-border/50 shadow-sm hidden md:block">
          <div className="flex gap-3">
            <Avatar src={user?.avatarUrl} name={user?.name ?? user?.username} size="sm" />
            {isLoggedIn ? (
              <button
                onClick={openCompose}
                className="flex-1 bg-surface-muted hover:bg-gray-200 text-left px-4 rounded-full text-muted-foreground text-[14px] font-semibold border border-surface-border/50 transition-colors py-2.5"
              >
                Post a property or client requirement…
              </button>
            ) : (
              <Link
                href={appRoutes.login}
                className="flex-1 bg-surface-muted text-left px-4 rounded-full text-muted-foreground text-[14px] font-semibold border border-surface-border/50 py-2.5"
              >
                Sign in to post properties or requirements
              </Link>
            )}
          </div>
          <div className="flex justify-between mt-3 px-2">
            <button onClick={openCompose} className="flex items-center gap-2 text-muted-foreground hover:bg-surface-muted p-2 rounded-lg text-[13px] font-semibold transition-colors">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              <span>Property photos</span>
            </button>
            <button onClick={openCompose} className="flex items-center gap-2 text-muted-foreground hover:bg-surface-muted p-2 rounded-lg text-[13px] font-semibold transition-colors">
              <Video className="w-5 h-5 text-green-500" />
              <span>Property video</span>
            </button>
            <button onClick={openCompose} className="flex items-center gap-2 text-muted-foreground hover:bg-surface-muted p-2 rounded-lg text-[13px] font-semibold transition-colors">
              <Calendar className="w-5 h-5 text-orange-400" />
              <span>Site visit</span>
            </button>
            <button onClick={openCompose} className="flex items-center gap-2 text-muted-foreground hover:bg-surface-muted p-2 rounded-lg text-[13px] font-semibold transition-colors">
              <FileText className="w-5 h-5 text-rose-400" />
              <span>Client note</span>
            </button>
          </div>
        </div>

        <ConnectionsRail />

        {isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : (
          data?.pages.flatMap((page) =>
            page.map((post) => <PostCard key={post.id} post={post} />),
          )
        )}

        <div ref={ref} className="py-4 text-center">
          {isFetchingNextPage ? (
            <PostSkeleton />
          ) : hasNextPage ? (
            <Button variant="ghost" size="sm" onClick={() => fetchNextPage()}>
              Load more
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              You&apos;re all caught up.
            </p>
          )}
        </div>
      </div>

      {/* RIGHT RAIL - Recommendations */}
      <aside className="hidden md:block w-[300px] shrink-0 space-y-4">
        <div className="bg-surface rounded-xl p-4 border border-surface-border/50 shadow-sm">
          <h3 className="font-bold text-[16px] text-foreground">Follow brokers and projects</h3>
          <div className="mt-4 space-y-4">
            {(suggested ?? []).map((s) => (
              <FollowItem
                key={s.id ?? s._id ?? s.username}
                targetUserId={String(s.id ?? s._id ?? "") || undefined}
                username={s.username}
                name={s.name ?? s.username ?? "Broker"}
                desc={s.headline ?? "Real estate broker"}
                avatar={s.avatarUrl}
              />
            ))}
            {(suggested?.length ?? 0) === 0 ? (
              <p className="text-xs text-muted-foreground">No recommendations right now.</p>
            ) : null}
          </div>
        </div>
      </aside>

      <Modal open={composeOpen && isLoggedIn} onClose={closeCompose} title="Create broker post">
        <PostComposerForm onPosted={closeCompose} />
      </Modal>
    </div>
  );
}

function FollowItem({
  targetUserId,
  username,
  name,
  desc,
  avatar,
}: {
  targetUserId?: string;
  username?: string;
  name: string;
  desc: string;
  avatar?: string;
}) {
  const imageSrc = avatar || `https://i.pravatar.cc/100?u=${encodeURIComponent(name)}`;
  const profileHref = username
    ? appRoutes.profile(username)
    : targetUserId
      ? appRoutes.profile(targetUserId)
      : null;
  const avatarBox = (
    <div className="w-10 h-10 shrink-0 rounded-md overflow-hidden bg-white border border-surface-border flex items-center justify-center p-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSrc} alt={name} className="object-contain w-full h-full" />
    </div>
  );
  return (
    <div className="flex items-start gap-3">
      {profileHref ? (
        <Link href={profileHref} aria-label={`View ${name}'s profile`}>
          {avatarBox}
        </Link>
      ) : (
        avatarBox
      )}
      <div className="flex-1 min-w-0">
        {profileHref ? (
          <Link
            href={profileHref}
            className="block text-[14px] font-bold text-foreground truncate hover:underline"
          >
            {name}
          </Link>
        ) : (
          <h4 className="text-[14px] font-bold text-foreground truncate">{name}</h4>
        )}
        <p className="text-[11px] text-muted-foreground font-medium truncate">{desc}</p>
        <FollowOrConnectButton targetUserId={targetUserId} variant="outline" label="+ Follow" />
      </div>
    </div>
  );
}
