"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function adminLogout() {
  const cookieStore = await cookies();

  cookieStore.set("admin_session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  redirect("/admin/login");
}
