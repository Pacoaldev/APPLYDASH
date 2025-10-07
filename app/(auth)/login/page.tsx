import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginForm from "./loginForm";
import { Suspense } from "react";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LoginPage() {
  // Check if user is already authenticated and redirect if so
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    redirect("/dashboard");
  }
  
  return (
    <Suspense fallback={<div>Loading login form...</div>}>
      <LoginForm />
    </Suspense>
  )
}