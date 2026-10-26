import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { getSiteContent } from "@/lib/content";
import { CLARK_STRATEGICS_URL, FOOTER } from "@/lib/home-copy";

export default async function SiteFooter() {
  const { contact, about } = await getSiteContent();
  const link =
    "on-dark inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold text-white hover:underline underline-offset-4";
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-[1440px] px-4 pb-8 pt-12 sm:px-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1.2fr_0.6fr]">
          <div>
            <p className="font-display text-[28px] font-bold tracking-[-0.03em]">{FOOTER.name}</p>
            <p className="mt-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em]">{FOOTER.descriptor}</p>
            <p className="mt-4 text-white/80">{FOOTER.line}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]">{FOOTER.location}</p>
            <p className="mt-3 max-w-md text-white/80">{FOOTER.availability}</p>
          </div>
          <nav aria-label="Footer" className="flex flex-col items-start">
            {contact.linkedinUrl && (
              <a className={link} href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer">
                LinkedIn <ArrowUpRight size={14} aria-hidden />
              </a>
            )}
            {contact.githubUrl && (
              <a className={link} href={contact.githubUrl} target="_blank" rel="noopener noreferrer">
                GitHub <ArrowUpRight size={14} aria-hidden />
              </a>
            )}
            {about.resumeUrl && (
              <a className={link} href={about.resumeUrl} target="_blank" rel="noopener noreferrer">
                Résumé <ArrowDown size={14} aria-hidden />
              </a>
            )}
            <a className={link} href={CLARK_STRATEGICS_URL} target="_blank" rel="noopener noreferrer">
              Clark Strategics <ArrowUpRight size={14} aria-hidden />
            </a>
            <Link className={link} href="/#contact">
              Contact
            </Link>
          </nav>
        </div>
        <p className="mt-10 border-t border-white/80 pt-6 font-mono text-[11px] font-medium uppercase tracking-[0.12em]">
          {FOOTER.copyright}
        </p>
      </div>
    </footer>
  );
}
