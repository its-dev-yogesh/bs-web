"use client";

import { useEffect, useRef, useState } from "react";

export function useIntersection<T extends Element = HTMLDivElement>(
  options: IntersectionObserverInit = { rootMargin: "200px" },
) {
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry?.isIntersecting ?? false);
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);

  return { ref, isIntersecting };
}
