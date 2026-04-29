import { PostDetailPage } from "@/components/pages/PostDetailPage";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raw = decodeURIComponent(String(id ?? "").trim());
  const uuid = raw.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
  )?.[0];
  if (uuid && uuid !== raw) {
    redirect(`/listings/${uuid}`);
  }
  return <PostDetailPage postId={uuid ?? raw} />;
}
