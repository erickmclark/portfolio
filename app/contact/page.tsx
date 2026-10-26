export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";
import { getSiteContent } from "@/lib/content";
import { resolveContactPrefill } from "@/lib/contact";
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
  const { intent, values } = resolveContactPrefill(sp);
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
          <ContactForm
            initialIntent={intent}
            initialValues={values}
            email={contact.email}
            linkedinUrl={contact.linkedinUrl}
            resumeUrl={about.resumeUrl}
          />
        </div>
      </div>
    </main>
  );
}
