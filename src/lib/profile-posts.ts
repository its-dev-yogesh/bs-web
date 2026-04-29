import type { Post, PublicProfile } from "@/types";

/** Attach profile display fields so timeline posts show the real name/avatar (not UUID placeholders). */
export function enrichPostsWithProfileOwner<T extends Post>(
  posts: T[],
  profileUserId: string,
  profile: Pick<PublicProfile, "username" | "name" | "avatarUrl" | "headline">,
): T[] {
  const pid = String(profileUserId).trim();
  if (!pid) return posts;
  return posts.map((post) => {
    if (String(post.author.id) !== pid) return post;
    return {
      ...post,
      author: {
        ...post.author,
        username: profile.username ?? post.author.username,
        name: profile.name ?? post.author.name,
        avatarUrl: profile.avatarUrl ?? post.author.avatarUrl,
        headline: profile.headline ?? post.author.headline,
      },
    };
  });
}
