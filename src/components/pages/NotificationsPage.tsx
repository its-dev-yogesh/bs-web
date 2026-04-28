"use client";

import { useNotifications } from "@/hooks/queries/useNotifications";

export function NotificationsPage() {
  const { data, isLoading } = useNotifications();

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (!data || data.items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 dark:border-gray-700">
        No notifications yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {data.items.map((n) => (
        <li
          key={n.id}
          className="rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <span className="font-medium">{n.actor.name}</span>{" "}
          <span className="text-gray-600 dark:text-gray-400">{n.type}</span>
        </li>
      ))}
    </ul>
  );
}
