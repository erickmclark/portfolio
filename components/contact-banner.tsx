import Link from "next/link";
import { getSiteContent } from "@/lib/content";

export default async function ContactBanner({ id }: { id?: string }) {
  const { contact, contactPage } = await getSiteContent();
  return (
    <section id={id} aria-labelledby="contact-banner-title" className="public-shell border-t border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
        <h2 id="contact-banner-title" className="max-w-[820px] font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
          {contactPage.heading}
        </h2>
        <p className="mt-5 max-w-[760px] text-lg font-medium leading-[1.35] sm:text-xl">{contactPage.intro}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href="/contact" className="on-dark inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-[15px] font-semibold text-white">
            Start a conversation
          </Link>
          <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center break-all rounded-full border-2 border-ink px-5 text-[15px] font-semibold hover:bg-white">
            {contact.email}
          </a>
        </div>
      </div>
    </section>
  );
}
