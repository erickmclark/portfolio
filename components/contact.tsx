import { ArrowUpRight, Mail } from "lucide-react";
import { getSiteContent } from "@/lib/content";
import { CONTACT } from "@/lib/home-copy";
import { CONTACT_INTENTS, contactHref } from "@/lib/contact";
import Link from "next/link";

export default async function Contact() {
  const { contact } = await getSiteContent();
  const btn = "inline-flex min-h-11 items-center gap-2 px-5 text-[15px] font-semibold";
  return (
    <section id="contact" aria-labelledby="contact-title" className="public-shell border-t border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
        <h2
          id="contact-title"
          className="max-w-[820px] font-display text-[40px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[80px]"
        >
          {CONTACT.heading}
        </h2>
        <p className="mt-6 max-w-[760px] text-xl font-medium leading-[1.3] sm:text-[26px]">{CONTACT.intro}</p>
        <div className="mt-10">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">What brings you here?</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {CONTACT_INTENTS.map((i) => (
              <Link key={i.id} href={contactHref(i.id)} className={`${btn} border-2 border-ink hover:bg-white`}>
                {i.label} <ArrowUpRight size={14} aria-hidden />
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-ink pt-6">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">Or write directly</p>
          <a
            href={`mailto:${contact.email}`}
            className="mt-3 inline-block break-all font-display text-2xl font-bold tracking-[-0.02em] underline underline-offset-4 sm:text-[28px]"
          >
            {contact.email}
          </a>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`mailto:${contact.email}`} className={`on-dark ${btn} bg-ink text-white`}>
              <Mail size={16} aria-hidden /> Email
            </a>
            {contact.linkedinUrl && (
              <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className={`${btn} border-2 border-ink hover:bg-white`}>
                LinkedIn <ArrowUpRight size={14} aria-hidden />
              </a>
            )}
            {contact.githubUrl && (
              <a href={contact.githubUrl} target="_blank" rel="noopener noreferrer" className={`${btn} border-2 border-ink hover:bg-white`}>
                GitHub <ArrowUpRight size={14} aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
