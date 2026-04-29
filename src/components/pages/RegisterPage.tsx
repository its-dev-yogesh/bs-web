import { AuthLayout } from "@/components/layouts/AuthLayout";
import { RegisterForm } from "@/components/forms/RegisterForm";

export function RegisterPage() {
  return (
    <AuthLayout title="Create your BrokerSocial account" subtitle="Join as buyer, renter, or broker in under a minute">
      <RegisterForm />
    </AuthLayout>
  );
}
