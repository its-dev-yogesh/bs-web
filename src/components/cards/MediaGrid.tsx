"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons/icons";

export function MediaGrid({ urls }: { urls: string[] }) {
  if (urls.length === 0) {
    return (
      <Tile
        url=""
        className="aspect-[4/3] w-full overflow-hidden rounded-lg"
      />
    );
  }

  if (urls.length === 1) {
    return (
      <Tile
        url={urls[0]}
        className="aspect-[4/3] w-full overflow-hidden rounded-lg"
      />
    );
  }

  if (urls.length === 2) {
    return (
      <div className="grid aspect-[4/3] grid-cols-2 gap-1 overflow-hidden rounded-lg">
        {urls.map((u, i) => (
          <Tile key={i} url={u} />
        ))}
      </div>
    );
  }

  if (urls.length === 3) {
    return (
      <div className="grid aspect-[4/3] grid-cols-2 gap-1 overflow-hidden rounded-lg">
        <Tile url={urls[0]} className="row-span-2" />
        <Tile url={urls[1]} />
        <Tile url={urls[2]} />
      </div>
    );
  }

  const visible = urls.slice(0, 4);
  const overflow = urls.length - 4;
  return (
    <div className="grid aspect-square grid-cols-2 gap-1 overflow-hidden rounded-lg">
      {visible.map((u, i) => (
        <div key={i} className="relative">
          <Tile url={u} />
          {i === 3 && overflow > 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
              +{overflow}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Tile({ url, className }: { url: string; className?: string }) {
  const [errored, setErrored] = useState(false);
  const showFallback = !url || errored;

  return (
    <div
      className={cn(
        "relative h-full w-full bg-surface-muted",
        className,
      )}
    >
      {showFallback ? (
        <Fallback />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}

function Fallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-surface-muted text-muted-foreground">
      <Icon name="home" width={28} height={28} />
      <span className="text-[10px] font-medium uppercase tracking-wide">
        No image
      </span>
    </div>
  );
}
