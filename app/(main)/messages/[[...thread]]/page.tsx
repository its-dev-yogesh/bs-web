import { MessagesPage } from "@/components/pages/MessagesPage";

export default async function Page({
  params,
}: {
  params: Promise<{ thread?: string[] }>;
}) {
  const { thread } = await params;
  return <MessagesPage thread={thread?.[0]} />;
}
