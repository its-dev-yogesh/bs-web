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
import { ComposePrompt } from "./ComposePrompt";

export function FeedSection() {
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

  return (
    <div className="flex flex-col gap-3">
      <ConnectionsRail />
      <ComposePrompt />

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

      <Modal open={composeOpen} onClose={closeCompose} title="Create a post">
        <PostComposerForm onPosted={closeCompose} />
      </Modal>
    </div>
  );
}
