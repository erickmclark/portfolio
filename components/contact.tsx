import { Mail } from "lucide-react";
import ContactDialog from "@/components/contact-dialog";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { getSiteContent } from "@/lib/content";

export default async function Contact() {
  const { contact, about, contactPage } = await getSiteContent();
  const btn = "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-semibold";
  return (
    <section id="contact" aria-labelledby="contact-title" className="public-shell border-t border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
        <h2
          id="contact-title"
          className="max-w-[820px] font-display text-[40px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[80px]"
        >
          {contactPage.heading}
        </h2>
        <p className="mt-6 max-w-[760px] text-xl font-medium leading-[1.3] sm:text-[26px]">{contactPage.intro}</p>
        <div className="mt-10">
          <ContactDialog sourcePage="/" topicLabels={contactPage.topics} email={contact.email} linkedinUrl={contact.linkedinUrl} resumeUrl={about.resumeUrl} />
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
                <LinkedInIcon size={16} /> LinkedIn
              </a>
            )}
            {contact.githubUrl && (
              <a href={contact.githubUrl} target="_blank" rel="noopener noreferrer" className={`${btn} border-2 border-ink hover:bg-white`}>
                <GitHubIcon size={16} /> GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
