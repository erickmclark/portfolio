export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import ContactDialog from "@/components/contact-dialog";
import { getSiteContent } from "@/lib/content";
import { resolveContactOpen } from "@/lib/contact";
import { CONTACT } from "@/lib/home-copy";

export const metadata: Metadata = {
  title: "Contact",
  description: CONTACT.intro,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ contact, about }, sp] = await Promise.all([
    getSiteContent(),
    searchParams,
  ]);
  const { intent, values } = resolveContactOpen(sp);
  return (
    <main id="main-content" className="public-shell">
      <div className="bg-white">
        <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-10 sm:py-20">
          <h1 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-[56px]">
            {CONTACT.heading}
          </h1>
          <p className="mt-5 max-w-[760px] text-lg font-medium leading-[1.35] sm:text-xl">
            {CONTACT.intro}
          </p>
          <div className="mt-10">
          <ContactDialog
            sourcePage="/contact"
            initialIntent={intent}
            initialValues={values}
            email={contact.email}
            linkedinUrl={contact.linkedinUrl}
            resumeUrl={about.resumeUrl}
          />
          <div className="mt-8 border-t border-ink pt-6">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">Or write directly</p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-3 inline-block break-all font-display text-2xl font-bold tracking-[-0.02em] underline underline-offset-4 sm:text-[28px]"
            >
              {contact.email}
            </a>
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}
