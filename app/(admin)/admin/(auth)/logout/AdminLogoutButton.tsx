"use client";

import { Button } from "@/components/ui/button";
import { adminLogout } from "./action";

export default function AdminLogoutButton() {
  return <Button onClick={() => adminLogout()}>Logout</Button>;
}
