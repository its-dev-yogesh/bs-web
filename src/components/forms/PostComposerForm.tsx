"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import {
  createPostSchema,
  PROPERTY_TYPES,
  LISTING_SALE_RENT,
  REQUIREMENT_BUY_RENT,
  type CreatePostInput,
} from "@/schemas/post.schema";
import { useCreatePost } from "@/hooks/mutations/useCreatePost";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Button } from "@/components/ui/button/Button";
import { InputField } from "@/components/ui/input/InputField";
import { TextField } from "./fields/TextField";
import { TextAreaField } from "./fields/TextAreaField";
import { SelectField } from "./fields/SelectField";
import { POST_MAX_LENGTH } from "@/constants";
import { cn } from "@/lib/cn";

type PostKind = "listing" | "requirement";

const PROPERTY_TYPE_OPTIONS = PROPERTY_TYPES.map((v) => ({
  value: v,
  label: v.charAt(0).toUpperCase() + v.slice(1),
}));

const LISTING_TYPE_OPTIONS = LISTING_SALE_RENT.map((v) => ({
  value: v,
  label: v === "sale" ? "For sale" : "For rent",
}));

const REQUIREMENT_TYPE_OPTIONS = REQUIREMENT_BUY_RENT.map((v) => ({
  value: v,
  label: v === "buy" ? "Looking to buy" : "Looking to rent",
}));

export function PostComposerForm({ onPosted }: { onPosted?: () => void }) {
  const user = useAppStore(selectUser);
  const isAgent = user?.type === "agent";
  const { mutate, isPending } = useCreatePost();

  const [kind, setKind] = useState<PostKind>(isAgent ? "listing" : "requirement");

  const defaultValues = useMemo<CreatePostInput>(
    () =>
      kind === "listing"
        ? {
            kind: "listing",
            title: "",
            description: "",
            locationText: "",
            price: 0,
            propertyType: "flat",
            listingType: "sale",
          }
        : {
            kind: "requirement",
            title: "",
            description: "",
            locationText: "",
            listingType: "buy",
          },
    [kind],
  );

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues,
    values: defaultValues,
  });

  const onSubmit = form.handleSubmit((values) =>
    mutate(values, {
      onSuccess: () => {
        form.reset(defaultValues);
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

      {isAgent && <KindToggle value={kind} onChange={setKind} />}

      <TextField
        control={form.control}
        name="title"
        label="Title"
        placeholder={
          kind === "listing"
            ? "e.g. 3 BHK in HSR Layout"
            : "e.g. Looking for 2 BHK near Whitefield"
        }
      />

      <TextAreaField
        control={form.control}
        name="description"
        placeholder="Add details (optional)"
        rows={4}
        maxLength={POST_MAX_LENGTH}
      />

      <TextField
        control={form.control}
        name="locationText"
        label="Location"
        placeholder="Area, city"
      />

      {kind === "listing" ? (
        <div className="grid grid-cols-2 gap-3">
          <Controller
            control={form.control}
            name="price"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="field-price"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Price (₹)
                </label>
                <InputField
                  id="field-price"
                  type="number"
                  placeholder="0"
                  error={Boolean(fieldState.error)}
                  value={field.value ?? ""}
                  onBlur={field.onBlur}
                  onChange={(e) => {
                    const raw = e.target.value;
                    field.onChange(raw === "" ? undefined : Number(raw));
                  }}
                />
                {fieldState.error?.message && (
                  <p className="text-xs text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
          <SelectField
            control={form.control}
            name="propertyType"
            label="Property type"
            options={PROPERTY_TYPE_OPTIONS}
          />
          <SelectField
            control={form.control}
            name="listingType"
            label="For"
            options={LISTING_TYPE_OPTIONS}
            className="col-span-2"
          />
        </div>
      ) : (
        <SelectField
          control={form.control}
          name="listingType"
          label="Looking to"
          options={REQUIREMENT_TYPE_OPTIONS}
        />
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={isPending}
          disabled={!form.formState.isValid}
        >
          Post {kind === "listing" ? "listing" : "requirement"}
        </Button>
      </div>
    </form>
  );
}

function KindToggle({
  value,
  onChange,
}: {
  value: PostKind;
  onChange: (k: PostKind) => void;
}) {
  return (
    <div className="inline-flex w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
      {(["listing", "requirement"] as const).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium transition",
            value === k
              ? "bg-brand text-white"
              : "bg-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800",
          )}
        >
          {k === "listing" ? "Property listing" : "Requirement"}
        </button>
      ))}
    </div>
  );
}
