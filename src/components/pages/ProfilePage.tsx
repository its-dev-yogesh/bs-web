"use client";

import { useProfile } from "@/hooks/queries/useProfile";
import { Avatar } from "@/components/ui/avatar/Avatar";

export function ProfilePage({ username }: { username: string }) {
  const { data, isLoading } = useProfile(username);

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (!data) return <p className="text-sm text-gray-500">User not found.</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <Avatar src={data.avatarUrl} name={data.name} size="xl" />
          <div>
            <h1 className="text-xl font-semibold">{data.name}</h1>
            {data.headline && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.headline}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {data.connectionsCount} connections
            </p>
          </div>
        </div>
        {data.bio && (
          <p className="mt-4 whitespace-pre-wrap text-sm">{data.bio}</p>
        )}
      </div>
    </div>
  );
}
