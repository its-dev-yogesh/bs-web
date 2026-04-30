"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button/Button";
import { useUpdatePost } from "@/hooks/mutations/usePostActions";
import { uiActions } from "@/store/actions/ui.actions";
import { postService } from "@/services/post.service";
import { uploadService } from "@/services/upload.service";
import type { Post } from "@/types";

const PROJECT_TYPES = ["Residential", "Commercial", "Industrial", "Mixed Use"];
const PROJECT_STATUSES = ["Ready to move", "Under Construction"];
const MAX_MEDIA = 8;

function detectMediaType(url: string): "image" | "video" | "document" {
  const lower = url.toLowerCase();
  if (/\.(mp4|mov|webm|mkv|avi)(\?|$)/.test(lower)) return "video";
  if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)(\?|$)/.test(lower)) return "document";
  return "image";
}

function normalizeListingType(
  raw: string | undefined,
  type: "listing" | "requirement",
): "sale" | "rent" | "buy" {
  if (type === "listing") {
    return raw === "rent" ? "rent" : "sale";
  }
  return raw === "rent" ? "rent" : "buy";
}

export function PostEditForm({
  post,
  onDone,
}: {
  post: Post;
  onDone?: () => void;
}) {
  const postType: "listing" | "requirement" =
    post.type === "requirement" ? "requirement" : "listing";
  const { mutate, isPending } = useUpdatePost();

  const [title, setTitle] = useState(post.title ?? "");
  const [content, setContent] = useState(post.content ?? "");
  const [location, setLocation] = useState(post.locationText ?? "");

  const [price, setPrice] = useState(
    typeof post.price === "number" ? String(post.price) : (post.price ?? ""),
  );
  const [listingType, setListingType] = useState<"sale" | "rent" | "buy">(
    normalizeListingType(post.listing_type, postType),
  );
  const [projectType, setProjectType] = useState(
    post.project_type ?? "Residential",
  );
  const [projectStatus, setProjectStatus] = useState(
    post.project_status ?? "Ready to move",
  );
  const [config, setConfig] = useState(post.config ?? "");
  const [amenities, setAmenities] = useState((post.amenities ?? []).join(", "));
  const [address, setAddress] = useState(post.address ?? "");
  const [areaSqft, setAreaSqft] = useState(
    post.area_sqft != null ? String(post.area_sqft) : "",
  );
  const [bhk, setBhk] = useState(post.bhk != null ? String(post.bhk) : "");
  const [bathrooms, setBathrooms] = useState(
    post.bathrooms != null ? String(post.bathrooms) : "",
  );
  const [budgetMin, setBudgetMin] = useState(
    post.budget_min != null ? String(post.budget_min) : "",
  );
  const [budgetMax, setBudgetMax] = useState(
    post.budget_max != null ? String(post.budget_max) : "",
  );

  const hasEngagement =
    (post.likeCount ?? 0) > 0 ||
    (post.commentCount ?? 0) > 0 ||
    (post.saveCount ?? 0) > 0 ||
    (post.repostCount ?? 0) > 0;
  /** Requirements are text-only; only listings ever expose the media editor. */
  const canEditMedia = postType === "listing" && !hasEngagement;
  const showMediaSection = postType === "listing";

  const { data: existingMedia = [] } = useQuery({
    queryKey: ["post-media", post.id],
    queryFn: () => postService.listMedia(post.id),
    enabled: canEditMedia,
  });
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [addedMedia, setAddedMedia] = useState<
    Array<{ url: string; type: "image" | "video" | "document" }>
  >([]);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const visibleExisting = useMemo(
    () => existingMedia.filter((m) => !removedMediaIds.includes(m.id)),
    [existingMedia, removedMediaIds],
  );
  const totalMediaAfter = visibleExisting.length + addedMedia.length;

  const toggleRemoveExisting = (id: string) => {
    setRemovedMediaIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const removeAdded = (url: string) => {
    setAddedMedia((prev) => prev.filter((m) => m.url !== url));
  };

  const addUrl = () => {
    const url = mediaUrlInput.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      uiActions.error("Invalid URL", "Please enter a valid URL.");
      return;
    }
    if (totalMediaAfter >= MAX_MEDIA) {
      uiActions.error("Media limit reached", `Up to ${MAX_MEDIA} files.`);
      return;
    }
    setAddedMedia((prev) => [...prev, { url, type: detectMediaType(url) }]);
    setMediaUrlInput("");
  };

  const handleFilePick = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const chosen = Array.from(files);
    if (totalMediaAfter + chosen.length > MAX_MEDIA) {
      uiActions.error("Media limit reached", `Up to ${MAX_MEDIA} files.`);
      return;
    }
    setUploadingFiles(true);
    try {
      const uploaded = await uploadService.uploadMixed(chosen, "posts");
      const items: Array<{ url: string; type: "image" | "video" | "document" }> = [
        ...(uploaded.images ?? []).map((f) => ({ url: f.url, type: "image" as const })),
        ...(uploaded.videos ?? []).map((f) => ({ url: f.url, type: "video" as const })),
        ...(uploaded.documents ?? []).map((f) => ({
          url: f.url,
          type: "document" as const,
        })),
      ];
      setAddedMedia((prev) => [...prev, ...items].slice(0, MAX_MEDIA));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle && !trimmedContent) {
      uiActions.error("Edit post", "Title or content is required.");
      return;
    }
    const amenitiesList = amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    mutate(
      {
        id: post.id,
        postType,
        title: trimmedTitle || undefined,
        description: trimmedContent || undefined,
        location_text: location.trim() || undefined,
        addMedia: canEditMedia && addedMedia.length > 0 ? addedMedia : undefined,
        removeMediaIds:
          canEditMedia && removedMediaIds.length > 0 ? removedMediaIds : undefined,
        project_type: projectType,
        project_status: projectStatus,
        config: config.trim() || undefined,
        ...(postType === "listing"
          ? {
              listing_type: listingType === "rent" ? "rent" : "sale",
              price: price ? Number(price) : undefined,
              address: address.trim() || undefined,
              area_sqft: areaSqft ? Number(areaSqft) : undefined,
              bhk: bhk ? Number(bhk) : undefined,
              bathrooms: bathrooms ? Number(bathrooms) : undefined,
              amenities: amenitiesList,
            }
          : {
              listing_type: listingType === "rent" ? "rent" : "buy",
              budget_min: budgetMin ? Number(budgetMin) : undefined,
              budget_max: budgetMax ? Number(budgetMax) : undefined,
              preferred_amenities: amenitiesList,
              preferred_location_text: location.trim() || undefined,
            }),
      },
      {
        onSuccess: () => onDone?.(),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={
          postType === "listing"
            ? "Listing title (e.g. 3 BHK in Bhopal)"
            : "Requirement title (e.g. Need 2 BHK on rent)"
        }
        className="h-10 w-full rounded-xl border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
      />
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location (optional)"
        className="h-10 w-full rounded-xl border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-surface-border bg-surface-muted/20">
        {postType === "listing" ? (
          <>
            <Field label="Price">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 8500000"
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
              />
            </Field>
            <Field label="Listing Type">
              <select
                value={listingType}
                onChange={(e) =>
                  setListingType(e.target.value as "sale" | "rent")
                }
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-2 text-sm text-foreground outline-none focus:border-brand"
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </Field>
          </>
        ) : (
          <>
            <Field label="Budget Min">
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="e.g. 5000000"
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
              />
            </Field>
            <Field label="Budget Max">
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="e.g. 9000000"
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
              />
            </Field>
            <Field label="Requirement Type" wide>
              <select
                value={listingType}
                onChange={(e) =>
                  setListingType(e.target.value as "buy" | "rent")
                }
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-2 text-sm text-foreground outline-none focus:border-brand"
              >
                <option value="buy">To Buy</option>
                <option value="rent">On Rent</option>
              </select>
            </Field>
          </>
        )}

        <Field label="Config">
          <input
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            placeholder="e.g. 2bhk, Villa"
            className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
          />
        </Field>

        {postType === "listing" && (
          <>
            <Field label="Area (sq ft)">
              <input
                type="number"
                value={areaSqft}
                onChange={(e) => setAreaSqft(e.target.value)}
                placeholder="e.g. 1500"
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
              />
            </Field>
            <Field label="BHK">
              <input
                type="number"
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                placeholder="e.g. 3"
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
              />
            </Field>
            <Field label="Bathrooms">
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="e.g. 2"
                className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
              />
            </Field>
          </>
        )}

        <Field label="Project Type">
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="h-9 w-full rounded-lg border border-surface-border bg-surface px-2 text-sm text-foreground outline-none focus:border-brand"
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={projectStatus}
            onChange={(e) => setProjectStatus(e.target.value)}
            className="h-9 w-full rounded-lg border border-surface-border bg-surface px-2 text-sm text-foreground outline-none focus:border-brand"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        {postType === "listing" && (
          <Field label="Full Address" wide>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, Manchester, KY"
              className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
            />
          </Field>
        )}

        <Field
          label={`${postType === "listing" ? "Amenities" : "Preferred Amenities"} (comma separated)`}
          wide
        >
          <input
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            placeholder="e.g. Pool, Gym, Parking"
            className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
          />
        </Field>
      </div>

      {showMediaSection && canEditMedia ? (
        <div className="space-y-2 rounded-xl border border-surface-border bg-surface-muted/20 p-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">
            Media
          </p>
          {visibleExisting.length > 0 ? (
            <div className="space-y-1">
              {visibleExisting.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-surface-border bg-surface px-3 py-2"
                >
                  <span className="truncate text-xs text-muted-foreground">
                    {m.type} · {m.url}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleRemoveExisting(m.id)}
                    className="text-xs font-semibold text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {addedMedia.length > 0 ? (
            <div className="space-y-1">
              {addedMedia.map((m) => (
                <div
                  key={m.url}
                  className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50/40 px-3 py-2"
                >
                  <span className="truncate text-xs text-emerald-700">
                    new · {m.type} · {m.url}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAdded(m.url)}
                    className="text-xs font-semibold text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="rounded-lg border border-dashed border-surface-border p-2">
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              disabled={uploadingFiles || totalMediaAfter >= MAX_MEDIA}
              onChange={(e) => {
                void handleFilePick(e.target.files);
                e.currentTarget.value = "";
              }}
              className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border file:border-surface-border file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground"
            />
            {uploadingFiles ? (
              <p className="mt-1 text-[11px] text-muted-foreground">Uploading…</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={mediaUrlInput}
              onChange={(e) => setMediaUrlInput(e.target.value)}
              placeholder="Or paste a media URL"
              className="h-9 w-full rounded-lg border border-surface-border bg-surface px-3 text-sm text-foreground outline-none focus:border-brand"
            />
            <Button type="button" variant="outline" onClick={addUrl}>
              Add
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {totalMediaAfter}/{MAX_MEDIA} files
          </p>
        </div>
      ) : showMediaSection ? (
        <p className="rounded-xl border border-surface-border bg-surface-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
          Media is locked because this post already has reactions or comments.
        </p>
      ) : null}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        placeholder={
          postType === "listing"
            ? "Describe property details, price, highlights..."
            : "Describe client budget, preferred area, and needs..."
        }
        className="w-full rounded-xl border border-surface-border bg-surface px-3 py-2 text-[13px] text-foreground outline-none focus:border-brand"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onDone?.()}
          className="rounded-full border border-surface-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted"
        >
          Cancel
        </button>
        <Button type="submit" loading={isPending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1 ${wide ? "sm:col-span-2" : ""}`}>
      <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
        {label}
      </label>
      {children}
    </div>
  );
}
