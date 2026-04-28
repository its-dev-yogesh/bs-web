"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { createPostSchema, type CreatePostInput } from "@/schemas/post.schema";
import { useCreatePost } from "@/hooks/mutations/useCreatePost";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Button } from "@/components/ui/button/Button";
import { TextAreaField } from "./fields/TextAreaField";
import { POST_MAX_LENGTH } from "@/constants";

export function PostComposerForm({ onPosted }: { onPosted?: () => void }) {
  const user = useAppStore(selectUser);
  const { mutate, isPending } = useCreatePost();

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: "", mediaUrls: [] },
  });

  const onSubmit = form.handleSubmit((values) =>
    mutate(values, {
      onSuccess: () => {
        form.reset();
        onPosted?.();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar
          src={user?.avatarUrl}
          name={user?.name ?? user?.username}
          size="md"
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {user?.name ?? user?.username ?? "You"}
          </span>
          <span className="text-xs text-muted-foreground">Post to anyone</span>
        </div>
      </div>
      <TextAreaField
        control={form.control}
        name="content"
        placeholder="What's on your mind?"
        rows={6}
        maxLength={POST_MAX_LENGTH}
      />
      <div className="flex justify-end">
        <Button type="submit" loading={isPending} disabled={!form.formState.isValid}>
          Post
        </Button>
      </div>
    </form>
  );
}
