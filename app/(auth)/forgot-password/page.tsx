import React, { Suspense } from "react";
import ForgotPasswordForm from "./forgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}