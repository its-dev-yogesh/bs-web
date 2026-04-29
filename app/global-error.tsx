"use client";

/**
 * Root error UI (Next.js): must include <html> and <body> and must not rely on
 * the root layout (no React context from Providers). See:
 * https://nextjs.org/docs/app/api-reference/file-conventions/error-handling
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <div className="grid min-h-[60vh] place-items-center px-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
            <p className="mt-2 text-sm text-gray-600">
              {error?.message || "An unexpected error occurred."}
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={reset}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
