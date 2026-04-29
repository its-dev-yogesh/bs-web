import { Suspense } from "react";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { LoginForm } from "@/components/forms/LoginForm";

export function LoginPage() {
  return (
    <AuthLayout title="Welcome back to BrokerSocial" subtitle="Sign in to continue posting listings and client requirements">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
