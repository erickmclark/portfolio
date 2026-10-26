import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import PrivacyLink from "@/components/privacy-link";
import { getSiteContent } from "@/lib/content";
import { CLARK_STRATEGICS_URL } from "@/lib/home-copy";
import { VIEWS, VIEW_LABELS } from "@/lib/home-view";

/** Decorative brand-shape frieze standing on the copyright rule; two repeats, swapped blue/pink. */
function Frieze() {
  return (
    <svg viewBox="0 0 670 62" aria-hidden="true" focusable="false" className="mt-12 block h-auto w-full">
      {[0, 360].map((x, i) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <rect x={i ? 58 : 0} y={29} width={78} height={33} className="fill-brand-pink" />
          <rect x={i ? 0 : 78} y={5} width={58} height={57} className="fill-brand-blue" />
          <rect x={136} y={0} width={17} height={62} className="fill-brand-green" />
          <rect x={153} y={41} width={89} height={21} className="fill-brand-orange" />
          <path d="M242 62V15a47 47 0 0 1 47 47Z" className="fill-brand-yellow" />
          <circle cx={i ? 300 : 350} cy={52} r={10} className="fill-brand-sky" />
        </g>
      ))}
    </svg>
  );
}

export default async function SiteFooter() {
  const { contact, about, site } = await getSiteContent();
  const FOOTER = site.footer;
  const link =
    "on-dark inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold text-white hover:underline underline-offset-4";
  const heading = "mb-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-white/60";
  return (
    <footer className="bg-ink pb-[calc(5rem+env(safe-area-inset-bottom))] text-white md:pb-0">
      <div className="mx-auto max-w-[1440px] px-4 pb-8 pt-12 sm:px-10">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
          <div>
            <p className="font-display text-[28px] font-bold tracking-[-0.03em]">{about.name}</p>
            <p className="mt-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em]">{FOOTER.descriptor}</p>
            <p className="mt-4 text-white/80">{FOOTER.line}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]">{FOOTER.location}</p>
            <p className="mt-3 max-w-md text-white/80">{FOOTER.availability}</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:col-span-2 xl:col-span-1 xl:grid-cols-[repeat(3,max-content)] xl:gap-x-10">
            <div className="flex flex-col items-start">
              <p className={heading}>Connect</p>
              {contact.linkedinUrl && (
                <a className={link} href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <LinkedInIcon size={16} brand /> LinkedIn
                </a>
              )}
              {contact.githubUrl && (
                <a className={link} href={contact.githubUrl} target="_blank" rel="noopener noreferrer">
                  <GitHubIcon size={16} /> GitHub
                </a>
              )}
              <Link className={link} href="/contact">
                Contact
              </Link>
            </div>
            <div className="flex flex-col items-start">
              <p className={heading}>More</p>
              {about.resumeUrl && (
                <a className={link} href={about.resumeUrl} target="_blank" rel="noopener noreferrer">
                  Résumé <ArrowDown size={14} aria-hidden />
                </a>
              )}
              <a className={link} href={CLARK_STRATEGICS_URL} target="_blank" rel="noopener noreferrer">
                Clark Strategics <ArrowUpRight size={14} aria-hidden />
              </a>
            </div>
            <div className="flex flex-col items-start">
              <p className={heading}>Legal</p>
              <PrivacyLink className={link} content={site.privacy} email={contact.email}>
                Privacy Policy
              </PrivacyLink>
            </div>
          </nav>
        </div>
        <Frieze />
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-white/80 pt-6 font-mono text-[11px] font-medium uppercase tracking-[0.12em]">
          <p>{FOOTER.copyright}</p>
          <p>{VIEWS.map((v) => VIEW_LABELS[v]).join(" · ")}</p>
        </div>
      </div>
    </footer>
  );
}
