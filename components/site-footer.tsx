import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import PrivacyLink from "@/components/privacy-link";
import { getSiteContent } from "@/lib/content";
import { CLARK_STRATEGICS_URL } from "@/lib/home-copy";

export default async function SiteFooter() {
  const { contact, about, site } = await getSiteContent();
  const FOOTER = site.footer;
  const link =
    "on-dark inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold text-white hover:underline underline-offset-4";
  return (
    <footer className="bg-ink pb-[calc(6.25rem+env(safe-area-inset-bottom))] text-white md:pb-0">
      <div className="mx-auto max-w-[1440px] px-4 pb-8 pt-12 sm:px-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1.2fr_0.6fr]">
          <div>
            <p className="font-display text-[28px] font-bold tracking-[-0.03em]">{about.name}</p>
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
                <LinkedInIcon size={16} /> LinkedIn
              </a>
            )}
            {contact.githubUrl && (
              <a className={link} href={contact.githubUrl} target="_blank" rel="noopener noreferrer">
                <GitHubIcon size={16} /> GitHub
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
            <Link className={link} href="/contact">
              Contact
            </Link>
            <PrivacyLink className={link} content={site.privacy} email={contact.email}>
              Privacy Policy
            </PrivacyLink>
          </nav>
        </div>
        <p className="mt-10 border-t border-white/80 pt-6 font-mono text-[11px] font-medium uppercase tracking-[0.12em]">
          {FOOTER.copyright}
        </p>
      </div>
    </footer>
  );
}
