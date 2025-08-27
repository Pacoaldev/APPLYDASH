import React, { Suspense } from "react";
import RegisterForm from "./registerForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading login form...</div>}>
      <RegisterForm />
    </Suspense>
  );
}