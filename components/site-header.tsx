"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { hashTargetId, sameDocumentHashId } from "@/lib/hash-link";
import { shouldSetPending } from "@/lib/bottom-nav-current";

type Props = { name: string; resumeUrl?: string };

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/about#approach", label: "Approach" },
  { href: "/about#experience", label: "Experience" },
  { href: "/about", label: "About" },
];

const link =
  "inline-flex min-h-11 items-center px-3 text-[15px] font-medium text-ink hover:underline underline-offset-4";

export default function SiteHeader({ name, resumeUrl }: Props) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  function onLinkClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    const hashId = sameDocumentHashId(href, pathname);
    const id = hashId && hashTargetId(`#${hashId}`);
    const el = id && shouldSetPending(e) ? document.getElementById(id) : null;
    if (!hashId || !el) return;
    e.preventDefault();
    if (window.location.hash !== `#${hashId}`) window.history.pushState(null, "", href);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  return (
    <header className="public-shell sticky top-0 z-50 border-b border-ink">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2 px-4 sm:px-10">
        <Link href="/" className="inline-flex min-h-11 items-center font-display text-xl font-bold tracking-[-0.04em]">
          {name}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={link} onClick={(e) => onLinkClick(e, l.href)}>
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className={link}>
            Contact
          </Link>
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="on-dark ml-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-[15px] font-semibold text-white"
            >
              Résumé <Download size={14} aria-hidden />
            </a>
          )}
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="on-dark inline-flex min-h-11 items-center gap-1 rounded-full bg-ink px-4 text-[15px] font-semibold text-white"
            >
              Résumé <Download size={14} aria-hidden />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
