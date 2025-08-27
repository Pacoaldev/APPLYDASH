import AdminLoginForm from "./adminLoginForm";
import { Suspense } from "react";

export default async function AdminLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}