import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long." })
  .regex(/(?=.*[a-z])/, {
    message: "Password must contain at least one lowercase letter.",
  })
  .regex(/(?=.*[A-Z])/, {
    message: "Password must contain at least one uppercase letter.",
  })
  .regex(/(?=.*\d)/, { message: "Password must contain at least one number." })
  .regex(/(?=.*[!@#$%^&*])/, {
    message: "Password must contain at least one special character (!@#$%^&*).",
  });