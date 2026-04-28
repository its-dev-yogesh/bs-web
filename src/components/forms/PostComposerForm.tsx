"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createPostSchema, type CreatePostInput } from "@/schemas/post.schema";
import { useCreatePost } from "@/hooks/mutations/useCreatePost";
import { Button } from "@/components/ui/button/Button";
import { TextAreaField } from "./fields/TextAreaField";
import { POST_MAX_LENGTH } from "@/constants";

export function PostComposerForm({ onPosted }: { onPosted?: () => void }) {
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
      <TextAreaField
        control={form.control}
        name="content"
        placeholder="What's on your mind?"
        rows={4}
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
