"use server";

import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import { createClient } from "@/utils/supabase/server";

export const resetPasswordFunc = async ({
  password,
  passwordConfirm,
}: {
  password: string;
  passwordConfirm: string;
}) => {
    
const validation = passwordMatchSchema.safeParse({
    password,
    passwordConfirm,
  });

  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: validation.data.password,
  });

  if (error) {
    return {
      error: true,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Password reset successful",
  };
};