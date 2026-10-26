"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { parseView, viewHref, type View } from "@/lib/home-view";
import { resumeDownloadHref } from "@/lib/resume";

type Props = { name: string; resumeUrl?: string };

const LINKS = [
  { path: "/work", label: "Work" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

const link =
  "inline-flex min-h-11 items-center px-3 text-[15px] font-medium text-ink hover:underline underline-offset-4";

function Header({ name, resumeUrl, view }: Props & { view: View }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="public-shell sticky top-0 z-50 border-b border-ink">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2 px-4 sm:px-10">
        <Link href={viewHref("/", view)} className="inline-flex min-h-11 items-center font-display text-xl font-bold tracking-[-0.04em]">
          {name}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.path} href={viewHref(l.path, view)} className={link}>
              {l.label}
            </Link>
          ))}
          {resumeUrl && (
            <a
              href={resumeDownloadHref(resumeUrl)}
              download
              className="on-dark ml-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-[15px] font-semibold text-white"
            >
              Résumé <Download size={14} aria-hidden />
            </a>
          )}
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          {resumeUrl && (
            <a
              href={resumeDownloadHref(resumeUrl)}
              download
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

function WithView(props: Props) {
  return <Header {...props} view={parseView(useSearchParams().get("view") ?? undefined)} />;
}

// useSearchParams needs a Suspense boundary on statically prerendered routes; the fallback renders the default-view links.
export default function SiteHeader(props: Props) {
  return (
    <Suspense fallback={<Header {...props} view="it" />}>
      <WithView {...props} />
    </Suspense>
  );
}
