export type ShareInput = {
  url: string;
  title?: string;
  text?: string;
};

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

export async function sharePost(input: ShareInput): Promise<ShareResult> {
  if (typeof window === "undefined") return "failed";

  const nav = window.navigator;

  if (nav.share) {
    try {
      await nav.share(input);
      return "shared";
    } catch (err) {
      // AbortError fires when the user dismisses the native sheet.
      if (err instanceof DOMException && err.name === "AbortError") {
        return "cancelled";
      }
      // Fall through to clipboard fallback on other errors.
    }
  }

  try {
    await nav.clipboard.writeText(input.url);
    return "copied";
  } catch {
    return "failed";
  }
}
