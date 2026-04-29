"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  imageStyle?: CSSProperties;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-xl",
} as const;

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ src, alt, name, size = "md", className, imageStyle }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-200 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300",
        sizeMap[size],
        className,
      )}
    >
      {src && !imageFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? "avatar"}
          className="h-full w-full object-cover"
          style={imageStyle}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </span>
  );
}
