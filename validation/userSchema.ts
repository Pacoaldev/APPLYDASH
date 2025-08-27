// /validation/userSchema.ts
import { z } from "zod";
import { passwordMatchSchema } from "./passwordMatchSchema";

export const registerFormSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address." }),
  })
  .and(passwordMatchSchema);