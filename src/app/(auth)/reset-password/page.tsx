import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { AuthCenteredLayout } from "@/components/auth-centered-layout";

export const metadata: Metadata = {
  title: "Redefinir senha",
};

export default function ResetPasswordPage() {
  return (
    <AuthCenteredLayout>
      <ResetPasswordForm />
    </AuthCenteredLayout>
  );
}
