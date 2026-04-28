import { Suspense } from "react";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { LoginForm } from "@/components/forms/LoginForm";

export function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in with your phone number">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
