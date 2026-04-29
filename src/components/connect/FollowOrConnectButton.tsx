"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useFollowBroker } from "@/hooks/mutations/useFollowBroker";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { appRoutes } from "@/config/routes/app.routes";
import { cn } from "@/lib/cn";

type Props = {
  /** Backend user id (UUID) of the broker to connect with */
  targetUserId: string | undefined;
  className?: string;
  /** `brandOutline` matches the post card header follow chip */
  variant?: "primary" | "outline" | "brandOutline";
  /** Visible label before the request is sent (can include an icon) */
  label?: ReactNode;
  /** From GET profile when Bearer sent — already connected */
  serverConnected?: boolean;
  /** From GET profile — viewer already sent a pending request */
  serverPendingOutgoing?: boolean;
  /** From GET profile — this person requested you; use Accept on profile instead */
  serverPendingIncoming?: boolean;
};

export function FollowOrConnectButton({
  targetUserId,
  className,
  variant = "outline",
  label = "+ Follow",
  serverConnected = false,
  serverPendingOutgoing = false,
  serverPendingIncoming = false,
}: Props) {
  const router = useRouter();
  const me = useAppStore(selectUser);
  const myId = me?._id ?? me?.id;
  const { mutate, isPending } = useFollowBroker();
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (serverPendingOutgoing) setSent(true);
  }, [serverPendingOutgoing]);

  const same =
    Boolean(targetUserId && myId) && String(myId) === String(targetUserId);

  // Instagram style: Hide if we are already following them
  if (same || !targetUserId || serverConnected || sent || serverPendingOutgoing) return null;

  const variantClass =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-1.5 px-5 py-1.5 rounded-full bg-brand hover:bg-brand-hover text-white text-[14px] font-bold transition disabled:opacity-70"
      : variant === "brandOutline"
        ? "rounded-full border border-brand px-3 py-1 text-[12px] font-bold text-brand transition hover:bg-brand-soft disabled:opacity-50"
        : "mt-1 rounded-full border border-muted-foreground/60 px-3 py-0.5 text-[12px] font-bold text-muted-foreground hover:bg-surface-muted transition disabled:opacity-70";

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!myId) {
      router.push(appRoutes.login);
      return;
    }
    mutate(targetUserId, {
      onSuccess: () => setSent(true),
    });
  };

  // If they follow us but we don't follow them, show "Follow Back"
  const finalLabel = serverPendingIncoming ? "Follow Back" : label;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={onClick}
      className={cn(variantClass, className)}
    >
      {isPending ? "…" : finalLabel}
    </button>
  );
}
