"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Menu, X } from "lucide-react";

type Props = { name: string; resumeUrl?: string };

const LINKS = [
  { href: "/work", label: "Work", dot: "bg-brand-blue" },
  { href: "/about#approach", label: "Approach", dot: "bg-brand-orange" },
  { href: "/about#experience", label: "Experience", dot: "bg-brand-green" },
  { href: "/about", label: "About", dot: "bg-brand-pink" },
];

const link =
  "inline-flex min-h-11 items-center px-3 text-[15px] font-medium text-ink hover:underline underline-offset-4";

export default function SiteHeader({ name, resumeUrl }: Props) {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  if (pathname.startsWith("/admin")) return null;

  const close = () => menu.current?.removeAttribute("open");

  return (
    <header className="public-shell sticky top-0 z-50 border-b border-ink">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2 px-4 sm:px-10">
        <Link href="/" className="inline-flex min-h-11 items-center font-display text-xl font-bold tracking-[-0.04em]">
          {name}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={link}>
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
          <Link href="/contact" onClick={close} className={link}>
            Contact
          </Link>
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
          <details ref={menu} className="group">
            <summary
              className="on-dark inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-ink bg-paper text-ink group-open:bg-ink group-open:text-white"
              aria-label="Menu"
            >
              <Menu size={20} aria-hidden className="group-open:hidden" />
              <X size={20} aria-hidden className="hidden group-open:block" />
            </summary>
            <nav
              aria-label="Menu"
              className="public-shell absolute inset-x-0 top-16 border-b border-ink px-4 pb-6"
            >
              <ul>
                {LINKS.map((l) => (
                  <li key={l.href} className="border-b border-ink">
                    <Link
                      href={l.href}
                      onClick={close}
                      className="flex min-h-14 items-center gap-3 font-display text-2xl font-bold tracking-[-0.03em]"
                    >
                      <span className={`h-2.5 w-2.5 ${l.dot}`} aria-hidden />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-mono text-xs tracking-wide text-ink-muted">
                Technology Strategy &amp; AI Transformation Executive
              </p>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
