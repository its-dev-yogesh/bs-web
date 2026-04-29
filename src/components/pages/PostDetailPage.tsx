"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePost } from "@/hooks/queries/usePost";
import { PostCard } from "@/components/cards/PostCard";
import { appRoutes } from "@/config/routes/app.routes";

export function PostDetailPage({ postId }: { postId: string }) {
  const router = useRouter();
  const { data: post, isLoading, isError, error } = usePost(postId);

  if (isLoading) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        Loading post…
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-10 text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "This post is unavailable or was removed."}
        </p>
        <Link
          href={appRoutes.listings}
          className="inline-flex text-sm font-semibold text-brand hover:underline"
        >
          Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 md:px-0 pb-16">
      <div className="flex items-center gap-2 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <Link
          href={appRoutes.listings}
          className="text-sm font-semibold text-brand hover:underline"
        >
          All listings
        </Link>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
        {post.type === "requirement" ? "Client requirement" : "Property listing"}
      </p>
      <PostCard post={post} />
    </div>
  );
}
