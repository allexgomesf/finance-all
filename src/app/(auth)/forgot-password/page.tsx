import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { AuthCenteredLayout } from "@/components/auth-centered-layout";

export const metadata: Metadata = {
  title: "Recuperar senha",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCenteredLayout>
      <ForgotPasswordForm />
    </AuthCenteredLayout>
  );
}
