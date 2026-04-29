"use client";

import Link from "next/link";
import { useProfile } from "@/hooks/queries/useProfile";
import { useListings } from "@/hooks/queries/useListings";
import { useFollowStatus } from "@/hooks/queries/useFollowStatus";
import { useToggleFollow } from "@/hooks/mutations/useToggleFollow";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Button } from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge/Badge";
import { Card } from "@/components/ui/card/Card";
import { Icon } from "@/components/icons/icons";
import { uiActions } from "@/store/actions/ui.actions";
import { appRoutes } from "@/config/routes/app.routes";
import { formatDate } from "@/lib/date";
import type { User } from "@/types";

export function ProfilePage({ username }: { username: string }) {
  const { data: profile, isLoading, isError } = useProfile(username);
  const me = useAppStore(selectUser);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !profile) {
    return (
      <Card className="p-8 text-center">
        <p className="text-base font-semibold text-foreground">
          Profile not found
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn&apos;t find a user matching &quot;{username}&quot;.
        </p>
      </Card>
    );
  }

  const isSelf = Boolean(
    me && (me._id === profile._id || me.id === profile.id),
  );
  const userId = profile._id ?? profile.id ?? "";

  return (
    <div className="flex flex-col gap-3">
      <ProfileHeader profile={profile} isSelf={isSelf} userId={userId} />
      <ProfileDetails profile={profile} />
      <UserPosts userId={userId} />
    </div>
  );
}

function ProfileHeader({
  profile,
  isSelf,
  userId,
}: {
  profile: User;
  isSelf: boolean;
  userId: string;
}) {
  const { data: status } = useFollowStatus(userId, !isSelf && Boolean(userId));
  const { mutate: toggleFollow, isPending } = useToggleFollow(userId);
  const isFollowing = Boolean(status?.is_following);

  function onToggle() {
    if (!userId) return;
    toggleFollow(isFollowing, {
      onError: () =>
        uiActions.error("Couldn't update follow", "Please try again."),
    });
  }

  const displayName = profile.name ?? profile.username;
  const followers = status?.followers_count ?? 0;
  const following = status?.following_count ?? 0;

  return (
    <Card className="overflow-hidden">
      <div
        aria-hidden
        className="h-28 w-full bg-linear-to-r from-sky-400 to-blue-600"
      />
      <div className="px-4 pb-4">
        <div className="-mt-12 flex items-end gap-3">
          <Avatar
            src={profile.avatarUrl}
            name={displayName}
            size="xl"
            className="ring-4 ring-surface"
          />
          <div className="ml-auto flex gap-2 pb-1">
            {isSelf ? (
              <Link href={appRoutes.me}>
                <Button variant="outline" size="sm">
                  My profile
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "primary"}
                onClick={onToggle}
                loading={isPending}
                startIcon={
                  isFollowing ? (
                    <Icon
                      name="check"
                      width={16}
                      height={16}
                      strokeWidth={3}
                    />
                  ) : (
                    <Icon name="plus" width={16} height={16} />
                  )
                }
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-foreground wrap-break-word">
            {displayName}
          </h1>
          {profile.type === "agent" ? (
            <Badge variant="brand">Agent</Badge>
          ) : null}
          {profile.is_verified ? (
            <Badge variant="success">
              <Icon
                name="check"
                width={10}
                height={10}
                strokeWidth={3}
                className="mr-0.5"
              />
              Verified
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">@{profile.username}</p>
        {profile.headline ? (
          <p className="mt-1 text-sm text-foreground/90 wrap-break-word">
            {profile.headline}
          </p>
        ) : null}

        <FollowCounts followers={followers} following={following} />
      </div>
    </Card>
  );
}

function FollowCounts({
  followers,
  following,
}: {
  followers: number;
  following: number;
}) {
  return (
    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
      <span>
        <span className="font-semibold text-foreground">{followers}</span>{" "}
        {followers === 1 ? "follower" : "followers"}
      </span>
      <span>
        <span className="font-semibold text-foreground">{following}</span>{" "}
        following
      </span>
    </div>
  );
}

function ProfileDetails({ profile }: { profile: User }) {
  const items: Array<{ icon: "pin" | "briefcase" | "bell"; text: string }> = [];
  if (profile.location)
    items.push({ icon: "pin", text: profile.location });
  if (profile.createdAt)
    items.push({
      icon: "bell",
      text: `Joined ${formatDate(profile.createdAt, { month: "long", year: "numeric" })}`,
    });

  if (!profile.bio && items.length === 0) return null;

  return (
    <Card className="px-4 py-4">
      {profile.bio ? (
        <p className="text-sm whitespace-pre-wrap wrap-break-word text-foreground/90">
          {profile.bio}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul
          className={
            profile.bio
              ? "mt-3 flex flex-col gap-1.5"
              : "flex flex-col gap-1.5"
          }
        >
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Icon name={item.icon} width={14} height={14} />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

function UserPosts({ userId }: { userId: string }) {
  const { data, isLoading } = useListings({ user_id: userId });

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-foreground">Posts</h2>

      {isLoading ? (
        <ul className="mt-3 flex flex-col gap-3">
          {[0, 1].map((i) => (
            <li
              key={i}
              className="h-14 animate-pulse rounded-lg bg-surface-muted"
            />
          ))}
        </ul>
      ) : !data?.length ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Nothing posted yet.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {data.map((post) => (
            <li
              key={post.id}
              className="rounded-lg border border-surface-border p-3"
            >
              {post.title ? (
                <p className="text-sm font-medium text-foreground wrap-break-word">
                  {post.title}
                </p>
              ) : null}
              {post.content ? (
                <p className="mt-1 line-clamp-3 text-xs text-muted-foreground wrap-break-word">
                  {post.content}
                </p>
              ) : null}
              {post.locationText ? (
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Icon name="pin" width={12} height={12} />
                  {post.locationText}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Card className="overflow-hidden">
        <div className="h-28 w-full animate-pulse bg-surface-muted" />
        <div className="px-4 pb-4">
          <div className="-mt-12 h-24 w-24 animate-pulse rounded-full bg-surface-muted ring-4 ring-surface" />
          <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
          <div className="mt-2 h-3 w-1/4 animate-pulse rounded bg-surface-muted" />
        </div>
      </Card>
    </div>
  );
}
