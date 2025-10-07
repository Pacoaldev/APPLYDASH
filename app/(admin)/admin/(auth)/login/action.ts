"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password cannot be empty"),
});

export async function adminLogin({ email, password }: z.infer<typeof loginSchema>) {
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return { error: true, message: "Invalid credentials" };
    }

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      return { error: true, message: "Invalid credentials" };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({ adminId: admin.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    return { success: true, message: "Login successful" };
  } catch (error) {
    console.error("Admin login error:", error);
    return { error: true, message: "A server error occurred." };
  }
}
