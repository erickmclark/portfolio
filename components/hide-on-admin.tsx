"use client";

import { usePathname } from "next/navigation";

/** Renders nothing on /admin, so public chrome (the footer) stays off the dashboard. */
export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname?.startsWith("/admin/")) return null;
  return <>{children}</>;
}
