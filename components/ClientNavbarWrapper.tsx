"use client";
import dynamic from "next/dynamic";
const NavbarDemo = dynamic(() => import("@/components/navbar").then(mod => mod.NavbarDemo), { ssr: false });
export default function ClientNavbarWrapper() {
  return <NavbarDemo />;
}
