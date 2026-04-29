"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useProfile } from "@/hooks/queries/useProfile";
import { useUpdateProfile } from "@/hooks/mutations/useUpdateProfile";
import { useSendDm } from "@/hooks/mutations/useSendDm";
import { useRespondConnectionRequest } from "@/hooks/mutations/useRespondConnectionRequest";
import { useDeleteAccount } from "@/hooks/mutations/useDeleteAccount";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Card } from "@/components/ui/card/Card";
import Link from "next/link";
import { MapPin, Plus, UserCheck, Users, MoreVertical, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal/Modal";
import { Button } from "@/components/ui/button/Button";
import { FollowOrConnectButton } from "@/components/connect/FollowOrConnectButton";
import { TextField } from "@/components/forms/fields/TextField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";
import { updateProfileSchema, type UpdateProfileInput } from "@/schemas/profile.schema";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { uiActions } from "@/store/actions/ui.actions";
import { appRoutes } from "@/config/routes/app.routes";
import { PostCard } from "@/components/cards/PostCard";
import { useProfilePosts } from "@/hooks/queries/useProfilePosts";
import { enrichPostsWithProfileOwner } from "@/lib/profile-posts";
import { uploadService } from "@/services/upload.service";
import { userService } from "@/services/user.service";
import { StoryOverlay } from "@/components/sections/StoryOverlay";
import {
  STORIES_STORAGE_KEY,
  getStoredStories,
  getStoredStoriesByUserId,
  type Story,
} from "@/lib/stories";

const BANNER_THEMES = [
  { key: "ocean", label: "Ocean", className: "from-blue-500 via-indigo-400 to-indigo-600" },
  { key: "sunset", label: "Sunset", className: "from-orange-400 via-rose-400 to-fuchsia-500" },
  { key: "forest", label: "Forest", className: "from-emerald-500 via-teal-400 to-cyan-500" },
  { key: "royal", label: "Royal", className: "from-violet-500 via-purple-500 to-indigo-600" },
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type DragState = {
  target: "avatar" | "banner";
  startY: number;
  startPosition: number;
  containerHeight: number;
};

export function ProfilePage({ username }: { username: string }) {
  const router = useRouter();
  const me = useAppStore(selectUser);
  const { data, isLoading } = useProfile(username);
  const { mutateAsync: updateProfileAsync, isPending } = useUpdateProfile();
  const { mutate: sendDm, isPending: sendingDm } = useSendDm();
  const { mutate: respondToRequest, isPending: respondingToRequest } =
    useRespondConnectionRequest();
  const { mutate: deleteAccount, isPending: deletingAccount } = useDeleteAccount();
  const [openEdit, setOpenEdit] = useState(false);
  const [dmOpen, setDmOpen] = useState(false);
  const [dmBody, setDmBody] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerImageFailed, setBannerImageFailed] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const isOwnProfile = Boolean(me?.username && data?.username && me.username === data.username);
  const targetUserId = data ? String(data._id ?? data.id ?? "").trim() : "";

  const [userStories, setUserStories] = useState<Story[]>([]);
  const [storyIndex, setStoryIndex] = useState<number | null>(null);

  /** Re-read localStorage stories whenever the profile target changes or another tab/page writes. */
  useEffect(() => {
    if (!targetUserId && !data?.username) {
      setUserStories([]);
      return;
    }
    const refresh = () => {
      // Try matching by userId first, then by username
      let stories = getStoredStoriesByUserId(targetUserId);
      if (!stories || stories.length === 0) {
        // Fallback: try matching by username
        const allStories = getStoredStories();
        stories = allStories.filter(s => s.username === data?.username);
      }
      setUserStories(stories);
    };
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORIES_STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [targetUserId, data?.username]);

  const hasStory = userStories && userStories.length > 0;

  const { data: profilePosts = [], isLoading: postsLoading } = useProfilePosts(
    targetUserId || undefined,
  );
  const timelinePosts = useMemo(() => {
    if (!data || !targetUserId) return [];
    return enrichPostsWithProfileOwner(profilePosts, targetUserId, data);
  }, [profilePosts, targetUserId, data]);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: "",
      name: "",
      headline: "",
      location: "",
      bio: "",
      avatarUrl: "",
      avatarPositionY: 50,
      avatarZoom: 1,
      bannerUrl: "",
      bannerPositionY: 50,
      bannerZoom: 1,
      bannerTheme: BANNER_THEMES[0].key,
    },
  });
  const bannerThemeValue = useWatch({ control: form.control, name: "bannerTheme" });
  const avatarPositionY = useWatch({ control: form.control, name: "avatarPositionY" });
  const bannerPositionY = useWatch({ control: form.control, name: "bannerPositionY" });
  const avatarZoom = useWatch({ control: form.control, name: "avatarZoom" });
  const bannerZoom = useWatch({ control: form.control, name: "bannerZoom" });
  const editAvatarUrl = useWatch({ control: form.control, name: "avatarUrl" });
  const editBannerUrl = useWatch({ control: form.control, name: "bannerUrl" });

  useEffect(() => {
    if (!data) return;
    form.reset({
      username: data.username ?? "",
      name: data.name ?? data.username ?? "",
      headline: data.headline ?? "",
      location: data.location ?? "",
      bio: data.bio ?? "",
      avatarUrl: data.avatarUrl ?? "",
      avatarPositionY: data.avatarPositionY ?? 50,
      avatarZoom: data.avatarZoom ?? 1,
      bannerUrl: data.bannerUrl ?? "",
      bannerPositionY: data.bannerPositionY ?? 50,
      bannerZoom: data.bannerZoom ?? 1,
      bannerTheme: data.bannerTheme ?? BANNER_THEMES[0].key,
    });
    setBannerImageFailed(false);
  }, [data, form]);

  const handleSendDm = () => {
    if (!targetUserId) {
      uiActions.error("Can't message", "Broker id unavailable.");
      return;
    }
    sendDm(
      { targetUserId, body: dmBody },
      {
        onSuccess: ({ threadId }) => {
          setDmOpen(false);
          router.push(appRoutes.thread(threadId));
        },
      },
    );
  };

  const handleUploadProfileImage = async (
    file: File | null,
    target: "avatar" | "banner",
  ) => {
    if (!file) return;
    if (!file.type.toLowerCase().startsWith("image/")) {
      uiActions.error("Invalid file", "Please upload an image file.");
      return;
    }
    const setLoading = target === "avatar" ? setUploadingAvatar : setUploadingBanner;
    setLoading(true);
    try {
      const uploaded = await uploadService.uploadSingle(
        file,
        target === "avatar" ? "profiles/avatar" : "profiles/banner",
      );
      if (target === "avatar") {
        form.setValue("avatarUrl", uploaded.url, { shouldDirty: true });
      } else {
        form.setValue("bannerUrl", uploaded.url, { shouldDirty: true });
        setBannerImageFailed(false);
      }
      uiActions.success(`${target === "avatar" ? "Avatar" : "Banner"} uploaded`);
    } catch (err) {
      uiActions.error(
        "Upload failed",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current) return;
      if (!accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    if (!dragState) return;
    const field =
      dragState.target === "avatar"
        ? ("avatarPositionY" as const)
        : ("bannerPositionY" as const);
    const onPointerMove = (event: PointerEvent) => {
      const deltaPercent =
        ((event.clientY - dragState.startY) / Math.max(1, dragState.containerHeight)) *
        100;
      form.setValue(field, clamp(dragState.startPosition + deltaPercent, 0, 100), {
        shouldDirty: true,
      });
    };
    const onPointerUp = () => setDragState(null);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragState, form]);

  if (isLoading) return <p className="text-sm text-gray-500 text-center p-8">Loading profile…</p>;
  if (!data) return <p className="text-sm text-gray-500 text-center p-8">Profile not found.</p>;

  const connCount = data.connectionsCount ?? 0;
  const selectedBannerTheme =
    BANNER_THEMES.find((t) => t.key === data.bannerTheme)?.className ??
    BANNER_THEMES[0].className;
  const resolvedBannerPositionY = Math.max(
    0,
    Math.min(100, data.bannerPositionY ?? 50),
  );
  const resolvedAvatarPositionY = Math.max(
    0,
    Math.min(100, data.avatarPositionY ?? 50),
  );
  const resolvedBannerZoom = clamp(data.bannerZoom ?? 1, 1, 3);
  const resolvedAvatarZoom = clamp(data.avatarZoom ?? 1, 1, 3);
  const previewAvatarPositionY = clamp(avatarPositionY ?? 50, 0, 100);
  const previewBannerPositionY = clamp(bannerPositionY ?? 50, 0, 100);
  const previewAvatarZoom = clamp(avatarZoom ?? 1, 1, 3);
  const previewBannerZoom = clamp(bannerZoom ?? 1, 1, 3);

  return (
    <div className="max-w-[850px] mx-auto space-y-4 px-4 md:px-0 pb-12">
      {/* Profile Header */}
      <Card className="overflow-visible border-surface-border/50 rounded-xl shadow-sm">
        <div className="overflow-hidden rounded-t-xl">
          <div className={`relative h-44 bg-gradient-to-r ${selectedBannerTheme}`}>
            {data.bannerUrl && !bannerImageFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.bannerUrl}
                alt={`${data.name ?? data.username} banner`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  objectPosition: `center ${resolvedBannerPositionY}%`,
                  transform: `scale(${resolvedBannerZoom})`,
                  transformOrigin: `center ${resolvedBannerPositionY}%`,
                }}
                onError={() => setBannerImageFailed(true)}
              />
            ) : null}
            {data.bannerUrl && !bannerImageFailed ? (
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/10" aria-hidden />
            ) : null}
          </div>
        </div>
        <div className="px-6 pb-6 relative">
          <div className="absolute -top-16 left-6">
            {hasStory ? (
              <button
                type="button"
                onClick={() => setStoryIndex(0)}
                aria-label={`View ${data.name ?? data.username}'s story`}
                className="rounded-full p-0.5 bg-linear-to-tr from-pink-500 via-fuchsia-500 to-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Avatar
                  src={data.avatarUrl}
                  name={data.name ?? data.username}
                  size="xl"
                  className="w-32 h-32 ring-2 ring-surface"
                  imageStyle={{
                    objectPosition: `center ${resolvedAvatarPositionY}%`,
                    transform: `scale(${resolvedAvatarZoom})`,
                    transformOrigin: `center ${resolvedAvatarPositionY}%`,
                  }}
                />
              </button>
            ) : (
              <Avatar
                src={data.avatarUrl}
                name={data.name ?? data.username}
                size="xl"
                className="w-32 h-32 ring-4 ring-surface"
                imageStyle={{
                  objectPosition: `center ${resolvedAvatarPositionY}%`,
                  transform: `scale(${resolvedAvatarZoom})`,
                  transformOrigin: `center ${resolvedAvatarPositionY}%`,
                }}
              />
            )}
          </div>
          
          <div className="pt-20 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                {isOwnProfile ? "Your profile" : "Broker profile"}
              </p>
              <h1 className="text-[24px] font-bold text-foreground leading-snug truncate">{data.name ?? data.username}</h1>
              <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">
                @{data.username}
              </p>
              <p className="text-[14px] text-gray-700 font-medium mt-1">{data.headline ?? "Broker profile"}</p>
              {isOwnProfile ? (
                <p className="text-[12px] text-muted-foreground mt-2 max-w-[520px] leading-relaxed">
                  Your profile link is built from your username (@{data.username}), so it stays the same when you change your display name or photo.
                  Bookmark{" "}
                  <Link href={appRoutes.myProfile} className="font-semibold text-brand hover:underline">
                    /profile
                  </Link>{" "}
                  for a short link that always opens your page.
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[13px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                  {data.location ?? "Location not provided"}
                </span>
              </div>

            </div>

            <div className="flex flex-wrap gap-2 mt-2 md:mt-0 shrink-0">
              {isOwnProfile ? (
                <>
                  <button
                    type="button"
                    onClick={() => setOpenEdit(true)}
                    className="px-5 py-1.5 rounded-full bg-brand hover:bg-brand-hover text-white text-[14px] font-bold transition"
                  >
                    Edit profile
                  </button>
                  <div className="relative" ref={accountMenuRef}>
                    <button
                      type="button"
                      aria-label="Profile actions"
                      onClick={() => setAccountMenuOpen((v) => !v)}
                      className="rounded-full border border-surface-border px-3 py-1.5 text-muted-foreground hover:bg-surface-muted"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {accountMenuOpen ? (
                      <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-surface-border bg-surface p-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            setDeleteAccountOpen(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-danger hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete account
                        </button>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <FollowOrConnectButton
                    targetUserId={targetUserId || undefined}
                    variant="primary"
                    className="flex items-center gap-1.5 px-5 py-1.5"
                    label={
                      <>
                        <Plus className="w-4 h-4" /> Connect
                      </>
                    }
                    serverConnected={Boolean(data.isConnected)}
                    serverPendingOutgoing={Boolean(data.pendingOutgoing)}
                    serverPendingIncoming={Boolean(data.pendingIncoming)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!me) {
                        router.push(appRoutes.login);
                        return;
                      }
                      setDmBody(`Hi @${data.username},\n\n`);
                      setDmOpen(true);
                    }}
                    className="px-5 py-1.5 rounded-full border border-gray-400 text-muted-foreground hover:bg-surface-muted text-[14px] font-bold transition"
                  >
                    Message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {!isOwnProfile && data.pendingIncoming && data.pendingRequestId ? (
        <Card className="p-4 sm:p-5 border-2 border-brand/35 bg-brand-soft/40 rounded-xl shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                <UserCheck className="h-6 w-6" strokeWidth={2} />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-brand">
                  Connection request
                </p>
                <p className="text-[16px] font-bold text-foreground mt-1">
                  {data.name ?? data.username} wants to connect with you
                </p>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Accept to add them to your network. You can also respond from{" "}
                  <Link href={appRoutes.notifications} className="font-semibold text-brand underline hover:no-underline">
                    Notifications
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0 lg:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={respondingToRequest}
                onClick={() =>
                  respondToRequest({
                    requestId: data.pendingRequestId!,
                    action: "decline",
                  })
                }
              >
                Decline
              </Button>
              <Button
                type="button"
                disabled={respondingToRequest}
                loading={respondingToRequest}
                onClick={() =>
                  respondToRequest({
                    requestId: data.pendingRequestId!,
                    action: "accept",
                  })
                }
              >
                Accept
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Network snapshot */}
      <Card className="px-6 py-4 border-surface-border/50 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Users className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <p className="text-[22px] font-bold text-foreground tabular-nums leading-none">{connCount}</p>
              <p className="text-[12px] text-muted-foreground font-semibold mt-1">Connections</p>
            </div>
          </div>
          <div className="hidden sm:block h-10 w-px bg-surface-border/80" aria-hidden />
          <div>
            <p className="text-[13px] font-semibold text-foreground capitalize">{data.type ?? "user"}</p>
            <p className="text-[12px] text-muted-foreground font-medium mt-0.5">Account</p>
          </div>
        </div>
        {isOwnProfile ? (
          <Link
            href={appRoutes.network}
            className="text-[13px] font-bold text-brand hover:underline shrink-0"
          >
            Manage network
          </Link>
        ) : (
          <Link
            href={appRoutes.network}
            className="text-[13px] font-semibold text-muted-foreground hover:text-foreground shrink-0"
          >
            Network
          </Link>
        )}
      </Card>

      {/* About Section */}
      <Card className="p-6 border-surface-border/50 rounded-xl shadow-sm">
        <h2 className="text-[18px] font-bold text-foreground mb-3">About</h2>
        <p className="text-[14px] text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
          {data.bio ?? "No bio added yet."}
        </p>
      </Card>

      {/* Profile timeline (listings + requirements) */}
      <div className="space-y-3">
        <h2 className="text-[18px] font-bold text-foreground">Posts</h2>
        {postsLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading posts…</p>
        ) : timelinePosts.length === 0 ? (
          <Card className="p-8 border border-surface-border/50 rounded-xl shadow-sm text-center">
            <p className="text-sm text-muted-foreground">
              {isOwnProfile
                ? "You haven’t published any listings or requirements yet."
                : "No posts to show yet."}
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-1">
            {timelinePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      <Modal open={openEdit} onClose={() => setOpenEdit(false)} title="Update Profile">
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(
            async (values) => {
              const id = String(me?._id ?? me?.id ?? data._id ?? data.id ?? "").trim();
              if (!id) {
                uiActions.error("Can't save profile", "Missing user id. Try signing out and back in.");
                return;
              }
              try {
                const nextUsername = values.username?.trim();
                const currentUsername = String(data.username ?? "").trim();
                if (nextUsername && nextUsername !== currentUsername) {
                  await userService.updateUsername(id, nextUsername);
                }
                await updateProfileAsync({ id, input: values });
                if (me) {
                  useAppStore.getState().setUser({
                    ...me,
                    ...values,
                    username: nextUsername || currentUsername,
                    _id: id,
                  });
                }
                setOpenEdit(false);
                if (nextUsername && nextUsername !== currentUsername) {
                  router.replace(appRoutes.profile(nextUsername));
                }
              } catch (error) {
                uiActions.error(
                  "Couldn't update profile",
                  error instanceof Error ? error.message : "Please try again.",
                );
              }
            },
            (errors) => {
              const first = Object.values(errors)[0] as { message?: string } | undefined;
              uiActions.error("Fix the form", first?.message ?? "Check highlighted fields.");
            },
          )}
        >
          <TextField control={form.control} name="username" label="Username" placeholder="your_handle" />
          <TextField control={form.control} name="name" label="Name" placeholder="Your full name" />
          <TextField control={form.control} name="headline" label="Headline" placeholder="Real estate broker" />
          <TextField control={form.control} name="location" label="Location" placeholder="Bhopal, MP" />
          <TextField control={form.control} name="avatarUrl" label="Avatar URL" placeholder="https://..." />
          <div className="rounded-xl border border-surface-border p-3">
            <p className="text-xs font-semibold text-muted-foreground">Live preview (drag image up/down)</p>
            <div className="mt-2 overflow-hidden rounded-lg border border-surface-border bg-gradient-to-r from-slate-100 to-slate-50">
              <div
                className={`relative h-24 overflow-hidden bg-gradient-to-r ${BANNER_THEMES.find((t) => t.key === bannerThemeValue)?.className ?? BANNER_THEMES[0].className} ${editBannerUrl ? "cursor-grab active:cursor-grabbing" : ""}`}
                onPointerDown={(event) => {
                  if (!editBannerUrl) return;
                  const h = event.currentTarget.getBoundingClientRect().height;
                  setDragState({
                    target: "banner",
                    startY: event.clientY,
                    startPosition: previewBannerPositionY,
                    containerHeight: h,
                  });
                }}
              >
                {editBannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editBannerUrl}
                    alt="Banner preview"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{
                      objectPosition: `center ${previewBannerPositionY}%`,
                      transform: `scale(${previewBannerZoom})`,
                      transformOrigin: `center ${previewBannerPositionY}%`,
                    }}
                  />
                ) : null}
              </div>
              <div className="relative -mt-8 ml-3 w-fit rounded-full ring-2 ring-white">
                <div
                  className="h-16 w-16 overflow-hidden rounded-full bg-slate-200 cursor-grab active:cursor-grabbing"
                  onPointerDown={(event) => {
                    if (!editAvatarUrl) return;
                    const h = event.currentTarget.getBoundingClientRect().height;
                    setDragState({
                      target: "avatar",
                      startY: event.clientY,
                      startPosition: previewAvatarPositionY,
                      containerHeight: h,
                    });
                  }}
                >
                  {editAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={editAvatarUrl}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: `center ${previewAvatarPositionY}%`,
                        transform: `scale(${previewAvatarZoom})`,
                        transformOrigin: `center ${previewAvatarPositionY}%`,
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2 rounded-xl border border-surface-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">Avatar position</p>
              <span className="text-[11px] font-medium text-muted-foreground">
                {Math.round(avatarPositionY ?? 50)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={avatarPositionY ?? 50}
              onChange={(e) =>
                form.setValue("avatarPositionY", Number(e.target.value), { shouldDirty: true })
              }
              className="w-full accent-brand"
            />
            <p className="text-[11px] text-muted-foreground">
              Move to choose which part of your photo stays visible.
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-surface-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">Avatar zoom</p>
              <span className="text-[11px] font-medium text-muted-foreground">
                {previewAvatarZoom.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={previewAvatarZoom}
              onChange={(e) =>
                form.setValue("avatarZoom", Number(e.target.value), { shouldDirty: true })
              }
              className="w-full accent-brand"
            />
          </div>
          <div className="rounded-xl border border-dashed border-surface-border p-3">
            <p className="text-xs font-semibold text-muted-foreground">Upload avatar image</p>
            <input
              type="file"
              accept="image/*"
              disabled={uploadingAvatar}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                void handleUploadProfileImage(file, "avatar");
                e.currentTarget.value = "";
              }}
              className="mt-2 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border file:border-surface-border file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground"
            />
            {uploadingAvatar ? (
              <p className="mt-2 text-[11px] text-muted-foreground">Uploading avatar…</p>
            ) : null}
          </div>
          <TextField control={form.control} name="bannerUrl" label="Banner image URL" placeholder="https://..." />
          <div className="space-y-2 rounded-xl border border-surface-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">Banner position</p>
              <span className="text-[11px] font-medium text-muted-foreground">
                {Math.round(bannerPositionY ?? 50)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={bannerPositionY ?? 50}
              onChange={(e) =>
                form.setValue("bannerPositionY", Number(e.target.value), { shouldDirty: true })
              }
              className="w-full accent-brand"
            />
            <p className="text-[11px] text-muted-foreground">
              Adjust the cover framing like LinkedIn.
            </p>
          </div>
          <div className="space-y-2 rounded-xl border border-surface-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">Banner zoom</p>
              <span className="text-[11px] font-medium text-muted-foreground">
                {previewBannerZoom.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={previewBannerZoom}
              onChange={(e) =>
                form.setValue("bannerZoom", Number(e.target.value), { shouldDirty: true })
              }
              className="w-full accent-brand"
            />
          </div>
          <div className="rounded-xl border border-dashed border-surface-border p-3">
            <p className="text-xs font-semibold text-muted-foreground">Upload banner image</p>
            <input
              type="file"
              accept="image/*"
              disabled={uploadingBanner}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                void handleUploadProfileImage(file, "banner");
                e.currentTarget.value = "";
              }}
              className="mt-2 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border file:border-surface-border file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground"
            />
            {uploadingBanner ? (
              <p className="mt-2 text-[11px] text-muted-foreground">Uploading banner…</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Banner theme</p>
            <div className="grid grid-cols-2 gap-2">
              {BANNER_THEMES.map((theme) => {
                const selected = bannerThemeValue === theme.key;
                return (
                  <button
                    key={theme.key}
                    type="button"
                    onClick={() => form.setValue("bannerTheme", theme.key)}
                    className={`rounded-lg border p-2 text-left transition ${
                      selected
                        ? "border-brand ring-2 ring-brand/30"
                        : "border-surface-border hover:border-brand/40"
                    }`}
                  >
                    <div className={`h-8 rounded-md bg-gradient-to-r ${theme.className}`} />
                    <p className="mt-1 text-xs font-semibold text-foreground">{theme.label}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Theme is used when banner image URL is empty.
            </p>
          </div>
          <TextAreaField
            control={form.control}
            name="bio"
            label="About"
            rows={4}
            placeholder="Tell clients and brokers about your work..."
          />
          <div className="flex justify-end">
            <Button type="submit" loading={isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={dmOpen} onClose={() => setDmOpen(false)} title="Message broker" mobilePosition="center">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Sends an in-app message to this broker.
          </p>
          <textarea
            value={dmBody}
            onChange={(e) => setDmBody(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-surface-border bg-surface px-3 py-2 text-[13px] text-foreground outline-none focus:border-brand"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDmOpen(false)}
              className="rounded-full border border-surface-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
            >
              Cancel
            </button>
            <Button type="button" loading={sendingDm} disabled={!dmBody.trim()} onClick={handleSendDm}>
              Send message
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        title="Delete account?"
        mobilePosition="center"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will permanently remove your account and profile data. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteAccountOpen(false)}
              className="rounded-full border border-surface-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
            >
              Cancel
            </button>
            <Button
              type="button"
              variant="danger"
              loading={deletingAccount}
              onClick={() => {
                const id = String(me?._id ?? me?.id ?? "").trim();
                if (!id) {
                  uiActions.error("Delete account", "Missing account id.");
                  return;
                }
                deleteAccount(id);
              }}
            >
              Delete account
            </Button>
          </div>
        </div>
      </Modal>

      {storyIndex !== null && userStories[storyIndex] ? (
        <StoryOverlay
          stories={userStories}
          index={storyIndex}
          isOwnStory={isOwnProfile}
          onClose={() => setStoryIndex(null)}
          onPrev={() => setStoryIndex((v) => (v && v > 0 ? v - 1 : v))}
          onNext={() =>
            setStoryIndex((v) => {
              if (v === null) return v;
              if (v < userStories.length - 1) return v + 1;
              return null;
            })
          }
          onDelete={
            isOwnProfile
              ? (target) => {
                  const remaining = getStoredStories().filter(
                    (s) => s.id !== target.id,
                  );
                  window.localStorage.setItem(
                    STORIES_STORAGE_KEY,
                    JSON.stringify(remaining),
                  );
                  const next = remaining.filter(
                    (s) => s.userId === targetUserId || s.username === data?.username,
                  );
                  setUserStories(next);
                  setStoryIndex(null);
                  uiActions.success("Story deleted");
                }
              : undefined
          }
          onMessage={
            isOwnProfile
              ? undefined
              : () => {
                  if (!me) {
                    router.push(appRoutes.login);
                    return;
                  }
                  const story = userStories[storyIndex];
                  const snippet = story?.content.trim().slice(0, 140) ?? "";
                  setStoryIndex(null);
                  setDmBody(
                    `Hi @${data.username},\n\nRegarding your story${
                      snippet ? `: "${snippet}"` : ""
                    }\n\n`,
                  );
                  setDmOpen(true);
                }
          }
        />
      ) : null}
    </div>
  );
}
