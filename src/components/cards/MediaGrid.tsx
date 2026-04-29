"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function MediaGrid({ urls }: { urls: string[] }) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return (
      <>
        <Tile
          url={urls[0]}
          className="aspect-[4/3] w-full overflow-hidden rounded-lg"
          onClick={() => setPreviewIndex(0)}
        />
        <ImagePreview
          urls={urls}
          index={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onPrev={() =>
            setPreviewIndex((prev) =>
              prev === null ? null : (prev - 1 + urls.length) % urls.length,
            )
          }
          onNext={() =>
            setPreviewIndex((prev) =>
              prev === null ? null : (prev + 1) % urls.length,
            )
          }
        />
      </>
    );
  }

  if (urls.length === 2) {
    return (
      <>
        <div className="grid aspect-[4/3] grid-cols-2 gap-1 overflow-hidden rounded-lg">
          {urls.map((u, i) => (
            <Tile key={i} url={u} onClick={() => setPreviewIndex(i)} />
          ))}
        </div>
        <ImagePreview
          urls={urls}
          index={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onPrev={() =>
            setPreviewIndex((prev) =>
              prev === null ? null : (prev - 1 + urls.length) % urls.length,
            )
          }
          onNext={() =>
            setPreviewIndex((prev) =>
              prev === null ? null : (prev + 1) % urls.length,
            )
          }
        />
      </>
    );
  }

  if (urls.length === 3) {
    return (
      <>
        <div className="grid aspect-[4/3] grid-cols-2 gap-1 overflow-hidden rounded-lg">
          <Tile
            url={urls[0]}
            className="row-span-2"
            onClick={() => setPreviewIndex(0)}
          />
          <Tile url={urls[1]} onClick={() => setPreviewIndex(1)} />
          <Tile url={urls[2]} onClick={() => setPreviewIndex(2)} />
        </div>
        <ImagePreview
          urls={urls}
          index={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onPrev={() =>
            setPreviewIndex((prev) =>
              prev === null ? null : (prev - 1 + urls.length) % urls.length,
            )
          }
          onNext={() =>
            setPreviewIndex((prev) =>
              prev === null ? null : (prev + 1) % urls.length,
            )
          }
        />
      </>
    );
  }

  const visible = urls.slice(0, 4);
  const overflow = urls.length - 4;
  return (
    <>
      <div className="grid aspect-square grid-cols-2 gap-1 overflow-hidden rounded-lg">
        {visible.map((u, i) => (
          <div key={i} className="relative">
            <Tile url={u} onClick={() => setPreviewIndex(i)} />
            {i === 3 && overflow > 0 ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
                +{overflow}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <ImagePreview
        urls={urls}
        index={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onPrev={() =>
          setPreviewIndex((prev) =>
            prev === null ? null : (prev - 1 + urls.length) % urls.length,
          )
        }
        onNext={() =>
          setPreviewIndex((prev) =>
            prev === null ? null : (prev + 1) % urls.length,
          )
        }
      />
    </>
  );
}

function ImagePreview({
  urls,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  urls: string[];
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (index === null || !urls[index]) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4">
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute inset-0"
      />
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
      >
        <X className="h-5 w-5" />
      </button>
      {urls.length > 1 ? (
        <button
          type="button"
          aria-label="Previous image"
          onClick={onPrev}
          className="absolute left-3 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 sm:left-6"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      ) : null}
      <div className="relative z-10 max-h-[90vh] w-full max-w-5xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urls[index]}
          alt="Preview"
          className="max-h-[90vh] w-full rounded-xl object-contain"
        />
      </div>
      {urls.length > 1 ? (
        <button
          type="button"
          aria-label="Next image"
          onClick={onNext}
          className="absolute right-3 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 sm:right-6"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      ) : null}
    </div>
  );
}

function Tile({
  url,
  className,
  onClick,
}: {
  url: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("h-full w-full cursor-zoom-in bg-surface-muted", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </button>
  );
}
