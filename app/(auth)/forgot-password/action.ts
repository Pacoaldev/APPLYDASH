// action.ts (Corrected and Simplified)
"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export const forgotPassword = async ({ email }: { email: string }) => {
  const forgotPasswordValidation = forgotPasswordSchema.safeParse({
    email,
  });

  if (!forgotPasswordValidation.success) {
    return {
      error: true,
      message: forgotPasswordValidation.error.issues[0]?.message,
    };
  }

  const supabase = await createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://applydash-wyxf4.ondigitalocean.app'}/forgot-password/reset-password`;
  

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  return {
    success: true,
    message:
      "If an account with that email exists, a password reset link has been sent.",
  };
};