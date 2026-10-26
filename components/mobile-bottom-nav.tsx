"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { BriefcaseBusiness, CircleUser, FileText, Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { resolveBottomNavItem, shouldSetPending, type BottomNavItem, type PendingBottomNav } from "@/lib/bottom-nav-current";

type Props = { resumeUrl?: string };

const item =
  "inline-flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-full focus-visible:rounded-full! px-1 text-[13px] leading-none font-semibold touch-manipulation [-webkit-tap-highlight-color:transparent]";
const ico = { "aria-hidden": true, size: 26, strokeWidth: 2.25 } as const;
const active = "bg-black/40 text-brand-sky";

export default function MobileBottomNav({ resumeUrl }: Props) {
  const pathname = usePathname();
  // Optimistic highlight for the in-flight navigation started by a tap; cleared as soon as the pathname changes.
  const [pending, setPending] = useState<PendingBottomNav | null>(null);
  if (pending && pathname !== pending.from) setPending(null);
  if (pathname.startsWith("/admin")) return null;

  const current = resolveBottomNavItem(pathname, pending);

  const cls = (key: BottomNavItem) => `${item} ${current === key ? active : ""}`;
  const aria = (key: BottomNavItem) => (current === key ? ("page" as const) : undefined);
  const tap = (key: BottomNavItem) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (shouldSetPending(e)) setPending({ key, from: pathname });
  };

  return (
    <nav
      aria-label="Quick navigation"
      style={{ bottom: "calc(12px + env(safe-area-inset-bottom))" }}
      className="bottom-nav font-body [&_a]:focus-visible:outline-brand-sky! fixed inset-x-3 z-40 mx-auto flex max-w-sm items-center justify-between rounded-full border border-white/15 bg-ink px-2 py-1 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] supports-[backdrop-filter]:bg-ink/45 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150 supports-[backdrop-filter]:backdrop-brightness-70 md:hidden"
    >
      <Link href="/work" aria-current={aria("work")} onClick={tap("work")} className={cls("work")}>
        <BriefcaseBusiness {...ico} />
        Work
      </Link>
      <Link href="/about" aria-current={aria("about")} onClick={tap("about")} className={cls("about")}>
        <CircleUser {...ico} />
        About
      </Link>
      <Link href="/contact" aria-current={aria("contact")} onClick={tap("contact")} className={cls("contact")}>
        <Mail {...ico} />
        Contact
      </Link>
      {resumeUrl && (
        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className={item}>
          <FileText {...ico} />
          Résumé
        </a>
      )}
    </nav>
  );
}
