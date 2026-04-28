"use client";

import { useEffect } from "react";
import { useFeed } from "@/hooks/queries/useFeed";
import { useIntersection } from "@/hooks/useIntersection";
import { PostCard } from "@/components/cards/PostCard";
import { PostSkeleton } from "@/components/skeletons/PostSkeleton";
import { PostComposerForm } from "@/components/forms/PostComposerForm";
import { Button } from "@/components/ui/button/Button";

export function FeedSection() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFeed();
  const { ref, isIntersecting } = useIntersection<HTMLDivElement>();

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <PostComposerForm />
      </div>

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage()}
          >
            Load more
          </Button>
        ) : (
          <p className="text-xs text-gray-500">You&apos;re all caught up.</p>
        )}
      </div>
    </div>
  );
}
