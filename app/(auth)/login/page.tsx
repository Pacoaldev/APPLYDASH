import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginForm from "./loginForm";
import { Suspense } from "react";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LoginPage() {
  // Don't redirect automatically - let the user complete the login process
  // The LoginForm component will handle the redirect after successful login
  
  return (
    <Suspense fallback={<div>Loading login form...</div>}>
      <LoginForm />
    </Suspense>
  )
}