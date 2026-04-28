export function MessagesPage({ thread }: { thread?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 dark:border-gray-700">
      Messages — coming soon. {thread ? `(thread: ${thread})` : ""}
    </div>
  );
}
