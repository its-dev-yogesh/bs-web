"use client";

import { useProfile } from "@/hooks/queries/useProfile";
import { useFollowStatus } from "@/hooks/queries/useFollowStatus";
import { useMyInsights } from "@/hooks/queries/useMyInsights";
import { useSavedPosts } from "@/hooks/queries/useListings";
import { useSentInquiries } from "@/hooks/queries/useSentInquiries";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Button } from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge/Badge";
import { Card } from "@/components/ui/card/Card";
import { Icon, type IconName } from "@/components/icons/icons";
import { formatDate, formatRelative } from "@/lib/date";
import type { PostInsight } from "@/services/me.service";
import type { User } from "@/types";

export function MyProfilePage() {
  const cachedUser = useAppStore(selectUser);
  const userId = cachedUser?._id ?? cachedUser?.id;
  const { data: profile, isLoading } = useProfile(userId ?? "");

  if (!userId) {
    return (
      <Card className="p-8 text-center">
        <p className="text-base font-semibold text-foreground">
          You&apos;re not signed in
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to view your profile.
        </p>
      </Card>
    );
  }

  if (isLoading || !profile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="flex flex-col gap-3">
      <Header profile={profile} userId={userId} />
      <InsightsSummaryCard userId={userId} />
      <MyPostsCard />
      <SavedPostsCard />
      <RecentInquiriesCard />
    </div>
  );
}

function Header({ profile, userId }: { profile: User; userId: string }) {
  const { data: status } = useFollowStatus(userId);
  const followers = status?.followers_count ?? 0;
  const following = status?.following_count ?? 0;
  const displayName = profile.name ?? profile.username;

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
          <div className="ml-auto pb-1">
            <Button variant="outline" size="sm" disabled>
              Edit profile
            </Button>
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
            <Badge variant="success">Verified</Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">@{profile.username}</p>
        {profile.headline ? (
          <p className="mt-1 text-sm text-foreground/90 wrap-break-word">
            {profile.headline}
          </p>
        ) : null}

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

        {profile.bio ? (
          <p className="mt-3 text-sm whitespace-pre-wrap wrap-break-word text-foreground/90">
            {profile.bio}
          </p>
        ) : null}

        {profile.location || profile.createdAt ? (
          <ul className="mt-3 flex flex-col gap-1.5">
            {profile.location ? (
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="pin" width={14} height={14} />
                <span>{profile.location}</span>
              </li>
            ) : null}
            {profile.createdAt ? (
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="bell" width={14} height={14} />
                <span>
                  Joined{" "}
                  {formatDate(profile.createdAt, {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}

function InsightsSummaryCard({ userId }: { userId: string }) {
  const { data, isLoading } = useMyInsights();
  const { data: status } = useFollowStatus(userId);

  const summary = data?.summary;
  const followers = status?.followers_count ?? summary?.followers_count ?? 0;
  const following = status?.following_count ?? summary?.following_count ?? 0;

  const stats: Array<{ icon: IconName; label: string; value: number }> = [
    { icon: "briefcase", label: "Posts", value: summary?.posts_count ?? 0 },
    { icon: "network", label: "Followers", value: followers },
    { icon: "network", label: "Following", value: following },
    { icon: "heart", label: "Likes", value: summary?.total_likes ?? 0 },
    { icon: "comment", label: "Comments", value: summary?.total_comments ?? 0 },
    { icon: "bookmark", label: "Saves", value: summary?.total_saves ?? 0 },
    { icon: "send", label: "Leads", value: summary?.total_inquiries ?? 0 },
  ];

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-foreground">Insights</h2>
      <p className="text-xs text-muted-foreground">
        Activity across all of your posts.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-surface-border bg-surface-muted/40 p-3"
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon name={s.icon} width={12} height={12} />
              <span>{s.label}</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {isLoading ? "—" : s.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MyPostsCard() {
  const { data, isLoading } = useMyInsights();
  const posts = data?.posts ?? [];

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-foreground">
        Your posts
        {!isLoading && posts.length > 0 ? (
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {posts.length}
          </span>
        ) : null}
      </h2>

      {isLoading ? (
        <ul className="mt-3 flex flex-col gap-3">
          {[0, 1].map((i) => (
            <li
              key={i}
              className="h-16 animate-pulse rounded-lg bg-surface-muted"
            />
          ))}
        </ul>
      ) : posts.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          You haven&apos;t posted anything yet.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {posts.map((post) => (
            <PostInsightRow key={post.post_id} post={post} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function PostInsightRow({ post }: { post: PostInsight }) {
  return (
    <li className="rounded-lg border border-surface-border p-3">
      {post.title ? (
        <p className="text-sm font-medium text-foreground wrap-break-word">
          {post.title}
        </p>
      ) : null}
      {post.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground wrap-break-word">
          {post.description}
        </p>
      ) : null}
      {post.createdAt ? (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {formatRelative(post.createdAt)}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <Stat icon="heart" value={post.likes_count} />
        <Stat icon="comment" value={post.comments_count} />
        <Stat icon="bookmark" value={post.saves_count} />
        <Stat
          icon="send"
          value={post.inquiries_count}
          highlight={post.inquiries_count > 0}
        />
      </div>
    </li>
  );
}

function Stat({
  icon,
  value,
  highlight,
}: {
  icon: IconName;
  value: number;
  highlight?: boolean;
}) {
  return (
    <span
      className={
        highlight
          ? "inline-flex items-center gap-1 font-medium text-brand"
          : "inline-flex items-center gap-1"
      }
    >
      <Icon name={icon} width={12} height={12} />
      {value}
    </span>
  );
}

function SavedPostsCard() {
  const { data, isLoading } = useSavedPosts();
  const items = data ?? [];

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-foreground">Saved posts</h2>

      {isLoading ? (
        <ul className="mt-3 flex flex-col gap-3">
          {[0, 1].map((i) => (
            <li
              key={i}
              className="h-12 animate-pulse rounded-lg bg-surface-muted"
            />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Posts you bookmark will appear here.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((post) => (
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
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground wrap-break-word">
                  {post.content}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function RecentInquiriesCard() {
  const { data, isLoading } = useSentInquiries();
  const items = data ?? [];

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-foreground">
        Recent inquiries you&apos;ve sent
      </h2>

      {isLoading ? (
        <ul className="mt-3 flex flex-col gap-2">
          {[0, 1].map((i) => (
            <li
              key={i}
              className="h-10 animate-pulse rounded bg-surface-muted"
            />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          You haven&apos;t connected with any posts yet.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {items.slice(0, 10).map((inq) => (
            <li
              key={inq._id}
              className="flex items-center justify-between gap-3 rounded border border-surface-border px-3 py-2 text-xs"
            >
              <span className="truncate text-muted-foreground">
                Post {inq.post_id.slice(0, 8)}…
                {inq.message ? (
                  <span className="ml-1 text-foreground">
                    — &ldquo;{inq.message}&rdquo;
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {inq.createdAt ? formatRelative(inq.createdAt) : ""}
              </span>
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
