/** Display label when API only exposes author user id (UUID), not a username. */
export const ANONYMOUS_AUTHOR_LABEL = "Verified Broker";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Map API `user_id` to post `author` fields. Never put {@link ANONYMOUS_AUTHOR_LABEL} in
 * `username` — that string is not a real handle and must not be used in `/profile/:username`.
 */
export function authorFromUserId(userId: string): {
  id: string;
  username: string;
  name?: string;
} {
  const id = String(userId ?? "").trim();
  if (!id) return { id: "", username: "" };
  if (UUID_REGEX.test(id)) {
    return {
      id,
      username: "",
      name: ANONYMOUS_AUTHOR_LABEL,
    };
  }
  return {
    id,
    username: id,
    name: undefined,
  };
}

/** Whether `slug` is safe to use as `/profile/:username` (not UUID, not placeholder). */
export function isResolvableProfileUsername(slug: string | undefined): boolean {
  const s = String(slug ?? "").trim();
  if (!s || UUID_REGEX.test(s)) return false;
  const lower = s.toLowerCase();
  if (lower === ANONYMOUS_AUTHOR_LABEL.toLowerCase()) return false;
  if (lower.replace(/\s+/g, "-") === "verified-broker") return false;
  return true;
}
