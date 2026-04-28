import { AuthLayout } from "@/components/layouts/AuthLayout";
import { RegisterForm } from "@/components/forms/RegisterForm";

export function RegisterPage() {
  return (
    <AuthLayout title="Create your account" subtitle="It only takes a minute.">
      <RegisterForm />
    </AuthLayout>
  );
}
