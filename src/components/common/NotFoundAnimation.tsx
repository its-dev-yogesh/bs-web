"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

type LottieJson = Record<string, unknown>;

export function NotFoundAnimation() {
  const [animationData, setAnimationData] = useState<LottieJson | null>(null);

  useEffect(() => {
    // File name contains a space, so use encoded URL.
    fetch("/Error%20404.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setAnimationData(json))
      .catch(() => setAnimationData(null));
  }, []);

  if (!animationData) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Lottie animationData={animationData} loop autoplay />
    </div>
  );
}
