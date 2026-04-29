import Link from "next/link";
import { appRoutes } from "@/config/routes/app.routes";
import { NotFoundAnimation } from "@/components/common/NotFoundAnimation";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="text-center">
        <NotFoundAnimation />
        <h2 className="text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href={appRoutes.home}
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
