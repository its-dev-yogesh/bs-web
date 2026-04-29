"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";
import { createPostSchema, type CreatePostInput } from "@/schemas/post.schema";
import { useCreatePost } from "@/hooks/mutations/useCreatePost";
import { uiActions } from "@/store/actions/ui.actions";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Button } from "@/components/ui/button/Button";
import { TextAreaField } from "./fields/TextAreaField";
import { POST_MAX_LENGTH } from "@/constants";
import Link from "next/link";
import { appRoutes } from "@/config/routes/app.routes";
import { cn } from "@/lib/cn";
import { uploadService } from "@/services/upload.service";

type ComposerType = "listing" | "requirement";
const MAX_MEDIA = 8;

export function PostComposerForm({ onPosted }: { onPosted?: () => void }) {
  const user = useAppStore(selectUser);
  const { mutate, isPending } = useCreatePost();
  const isLoggedIn = Boolean(user?._id ?? user?.id);
  const [postType, setPostType] = useState<ComposerType>("listing");

  /** Only explicit `type === "user"` is a client; missing type must not block listing (session/API quirks). */
  const isClientAccount = user?.type === "user";

  const selectedPostType: ComposerType = isClientAccount
    ? "requirement"
    : postType;
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Property Listing Fields
  const [price, setPrice] = useState("");
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [projectType, setProjectType] = useState("Residential");
  const [projectStatus, setProjectStatus] = useState("Ready to move");
  const [config, setConfig] = useState("");
  const [amenities, setAmenities] = useState("");
  const [address, setAddress] = useState("");
  const [areaSqft, setAreaSqft] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: "", mediaUrls: [] },
  });

  const onSubmit = form.handleSubmit((values) => {
    if (selectedPostType === "listing" && isClientAccount) {
      uiActions.error(
        "Only brokers can publish listings",
        "Post a client requirement, or sign in with a broker account.",
      );
      return;
    }

    const mediaItems = mediaUrls.map((url) => {
      const lower = url.toLowerCase();
      if (/\.(mp4|mov|webm|mkv|avi)(\?|$)/.test(lower)) {
        return { url, type: "video" as const };
      }
      if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)(\?|$)/.test(lower)) {
        return { url, type: "document" as const };
      }
      return { url, type: "image" as const };
    });

    mutate(
      {
        postType: selectedPostType,
        title:
          title.trim() ||
          (selectedPostType === "listing"
            ? "Property listing"
            : "Client requirement"),
        location: location.trim(),
        whatsappNumber: whatsappNumber.trim() || undefined,
        content: values.content.trim(),
        mediaUrls: mediaItems
          .filter((m) => m.type === "image")
          .map((m) => m.url),
        mediaItems,
        // Listing/Requirement shared
        projectType,
        projectStatus,
        config: config || undefined,
        amenities: amenities ? amenities.split(",").map(a => a.trim()).filter(Boolean) : [],
        // Listing specific
        price: selectedPostType === "listing" ? (price ? Number(price) : undefined) : undefined,
        listingType: selectedPostType === "listing" ? listingType : (listingType === "rent" ? "rent" : "buy"),
        address: selectedPostType === "listing" ? (address || undefined) : undefined,
        area_sqft: selectedPostType === "listing" ? (areaSqft ? Number(areaSqft) : undefined) : undefined,
        // Requirement specific
        budgetMin: selectedPostType === "requirement" ? (budgetMin ? Number(budgetMin) : undefined) : undefined,
        budgetMax: selectedPostType === "requirement" ? (budgetMax ? Number(budgetMax) : undefined) : undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          setTitle("");
          setLocation("");
          setWhatsappNumber("");
          setMediaUrlInput("");
          setMediaUrls([]);
          setPrice("");
          setConfig("");
          setAmenities("");
          setAddress("");
          setAreaSqft("");
          setBudgetMin("");
          setBudgetMax("");
          onPosted?.();
        },
      },
    );
  });

  const addMediaUrl = () => {
    const next = mediaUrlInput.trim();
    if (!next) return;
    try {
      new URL(next);
    } catch {
      uiActions.error("Invalid image URL", "Please enter a valid URL.");
      return;
    }
    if (mediaUrls.includes(next)) {
      uiActions.error("Already added", "This image URL is already in the list.");
      return;
    }
    if (mediaUrls.length >= MAX_MEDIA) {
      uiActions.error("Media limit reached", `You can add up to ${MAX_MEDIA} images.`);
      return;
    }
    setMediaUrls((prev) => [...prev, next]);
    setMediaUrlInput("");
  };

  const removeMediaUrl = (url: string) => {
    setMediaUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleFilePick = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const chosen = Array.from(files);
    if (mediaUrls.length + chosen.length > MAX_MEDIA) {
      uiActions.error("Media limit reached", `You can add up to ${MAX_MEDIA} files.`);
      return;
    }
    setUploadingFiles(true);
    try {
      const uploaded = await uploadService.uploadMixed(chosen, "posts");
      const urls = [
        ...(uploaded.images ?? []).map((f) => f.url),
        ...(uploaded.videos ?? []).map((f) => f.url),
        ...(uploaded.documents ?? []).map((f) => f.url),
      ];
      setMediaUrls((prev) => [...prev, ...urls].slice(0, MAX_MEDIA));
      uiActions.success("Files uploaded");
    } catch (err) {
      uiActions.error(
        "Upload failed",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setUploadingFiles(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-surface-border bg-surface p-4 text-center">
        <p className="text-sm text-muted-foreground">Sign in to create property posts and client requirements.</p>
        <Link href={appRoutes.login} className="mt-3 inline-flex rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="rounded-xl border border-surface-border bg-surface-muted/40 p-3">
        <p className="text-xs font-semibold text-muted-foreground">Post type</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isClientAccount}
            title={
              isClientAccount
                ? "Only broker accounts can publish property listings"
                : undefined
            }
            onClick={() => setPostType("listing")}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs font-semibold transition",
              selectedPostType === "listing"
                ? "border-brand bg-brand-soft text-brand"
                : "border-surface-border bg-surface text-muted-foreground",
              isClientAccount && "cursor-not-allowed opacity-50",
            )}
          >
            Property Listing
          </button>
          <button
            type="button"
            onClick={() => setPostType("requirement")}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs font-semibold transition",
              selectedPostType === "requirement"
                ? "border-brand bg-brand-soft text-brand"
                : "border-surface-border bg-surface text-muted-foreground",
            )}
          >
            Client Requirement
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface p-3">
        <Avatar
          src={user?.avatarUrl}
          name={user?.name ?? user?.username}
          size="md"
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {user?.name ?? user?.username ?? "You"}
          </span>
          <span className="text-xs text-muted-foreground">Visible to broker network</span>
        </div>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={selectedPostType === "listing" ? "Listing title (e.g. 3 BHK in Bhopal)" : "Requirement title (e.g. Need 2 BHK on rent)"}
        className="h-10 w-full rounded-xl border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
      />
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location (optional)"
        className="h-10 w-full rounded-xl border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
      />
      <input
        value={whatsappNumber}
        onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
        placeholder="WhatsApp number with country code (optional)"
        className="h-10 w-full rounded-xl border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-surface-border bg-surface-muted/20">
        {selectedPostType === "listing" ? (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 8500000"
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Listing Type</label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value as "sale" | "rent")}
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-2 text-sm text-foreground outline-none focus:border-brand"
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Budget Min</label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="e.g. 5000000"
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Budget Max</label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="e.g. 9000000"
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Requirement Type</label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value as "sale" | "rent")}
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-2 text-sm text-foreground outline-none focus:border-brand"
              >
                <option value="sale">To Buy</option>
                <option value="rent">On Rent</option>
              </select>
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Config</label>
          <input
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            placeholder="e.g. 2bhk, Villa"
            className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
          />
        </div>

        {selectedPostType === "listing" && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Area (sq ft)</label>
            <input
              type="number"
              value={areaSqft}
              onChange={(e) => setAreaSqft(e.target.value)}
              placeholder="e.g. 1500"
              className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Project Type</label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="h-9 w-full rounded-lg border border-surface-border bg-surface px-2 text-sm text-foreground outline-none focus:border-brand"
          >
            {["Residential", "Commercial", "Industrial", "Mixed Use"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Status</label>
          <select
            value={projectStatus}
            onChange={(e) => setProjectStatus(e.target.value)}
            className="h-9 w-full rounded-lg border border-surface-border bg-surface px-2 text-sm text-foreground outline-none focus:border-brand"
          >
            {["Ready to move", "Under Construction"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {selectedPostType === "listing" && (
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Full Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, Manchester, KY"
              className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
            />
          </div>
        )}

        <div className="sm:col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
            {selectedPostType === "listing" ? "Amenities" : "Preferred Amenities"} (comma separated)
          </label>
          <input
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            placeholder="e.g. Pool, Gym, Parking"
            className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
          />
        </div>
      </div>
      <TextAreaField
        control={form.control}
        name="content"
        placeholder={
          selectedPostType === "listing"
            ? "Describe property details, price, highlights..."
            : "Describe client budget, preferred area, and needs..."
        }
        rows={5}
        maxLength={POST_MAX_LENGTH}
      />
      <div className="space-y-2">
        <div className="rounded-xl border border-dashed border-surface-border p-3">
          <label className="text-xs font-semibold text-muted-foreground">
            Upload images/videos/documents (PDF)
          </label>
          <input
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            disabled={uploadingFiles}
            onChange={(e) => {
              void handleFilePick(e.target.files);
              e.currentTarget.value = "";
            }}
            className="mt-2 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border file:border-surface-border file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground"
          />
          {uploadingFiles ? (
            <p className="mt-2 text-[11px] text-muted-foreground">Uploading files…</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={mediaUrlInput}
            onChange={(e) => setMediaUrlInput(e.target.value)}
            placeholder="Add image URL (https://...)"
            className="h-10 w-full rounded-xl border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
          />
          <Button type="button" variant="outline" onClick={addMediaUrl}>
            Add
          </Button>
        </div>
        {mediaUrls.length > 0 ? (
          <div className="space-y-1">
            {mediaUrls.map((url) => (
              <div
                key={url}
                className="flex items-center justify-between rounded-lg border border-surface-border bg-surface px-3 py-2"
              >
                <span className="truncate text-xs text-muted-foreground">{url}</span>
                <button
                  type="button"
                  onClick={() => removeMediaUrl(url)}
                  className="text-xs font-semibold text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <p className="text-[11px] text-muted-foreground">
          Added {mediaUrls.length}/{MAX_MEDIA} images
        </p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={isPending} disabled={!form.formState.isValid}>
          Publish {selectedPostType === "listing" ? "listing" : "requirement"}
        </Button>
      </div>
    </form>
  );
}
