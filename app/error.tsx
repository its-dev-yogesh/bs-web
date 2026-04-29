"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
