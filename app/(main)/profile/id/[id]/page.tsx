import { redirect } from "next/navigation";
import { appRoutes } from "@/config/routes/app.routes";

export default async function ProfileByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(appRoutes.profile(id));
}
