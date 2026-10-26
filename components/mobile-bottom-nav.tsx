"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { currentBottomNavItem } from "@/lib/bottom-nav-current";

type Props = { resumeUrl?: string };

const item =
  "inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full focus-visible:rounded-full! px-3 text-[15px] font-semibold";
const active = "bg-white/15";

export default function MobileBottomNav({ resumeUrl }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const admin = pathname.startsWith("/admin");
  const current = currentBottomNavItem(pathname);

  useEffect(() => {
    if (admin) return;
    const details = document.querySelector<HTMLDetailsElement>("header details");
    const onToggle = () => setMenuOpen(!!details?.open);
    details?.addEventListener("toggle", onToggle);
    return () => details?.removeEventListener("toggle", onToggle);
  }, [admin, pathname]);

  if (admin) return null;

  const openMenu = () => {
    const details = document.querySelector<HTMLDetailsElement>("header details");
    if (!details) return;
    details.open = !details.open;
    window.scrollTo({ top: 0 });
  };

  const cls = (key: "work" | "about" | "contact") => `${item} ${current === key ? active : ""}`;
  const aria = (key: "work" | "about" | "contact") => (current === key ? ("page" as const) : undefined);

  return (
    <nav
      aria-label="Quick navigation"
      style={{ bottom: "calc(12px + env(safe-area-inset-bottom))" }}
      className="bottom-nav font-body [&_a]:focus-visible:outline-brand-sky! [&_button]:focus-visible:outline-brand-sky! fixed inset-x-3 z-40 mx-auto flex max-w-sm items-center justify-between rounded-full border border-white/15 bg-ink px-1 py-1 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] supports-[backdrop-filter]:bg-ink/75 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150 md:hidden"
    >
      <Link href="/work" aria-current={aria("work")} className={cls("work")}>
        Work
      </Link>
      <Link href="/about" aria-current={aria("about")} className={cls("about")}>
        About
      </Link>
      <Link href="/contact" aria-current={aria("contact")} className={cls("contact")}>
        Contact
      </Link>
      {resumeUrl && (
        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className={item}>
          Résumé
        </a>
      )}
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={menuOpen}
        onClick={openMenu}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full focus-visible:rounded-full!"
      >
        <Menu size={20} aria-hidden />
      </button>
    </nav>
  );
}
