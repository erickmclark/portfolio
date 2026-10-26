export const dynamic = 'force-dynamic';

import { Fragment } from 'react';
import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/content';
import { Eyebrow } from '@/components/section-head';

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSiteContent();
  return {
    title: site.seo.privacy.title,
    description: site.seo.privacy.description,
    alternates: { canonical: '/privacy' },
    robots: { index: false, follow: false },
  };
}

function Row({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t-[1.5px] border-ink py-8 lg:flex lg:gap-[72px]">
      <h2 id={id} className="font-display text-[22px] font-bold leading-[1.15] tracking-[-0.01em] lg:w-[380px] lg:shrink-0">
        {title}
      </h2>
      <div className="mt-4 max-w-[68ch] space-y-3 text-[17px] leading-[1.55] lg:mt-0 lg:flex-1">{children}</div>
    </section>
  );
}

function Paragraph({ text, email }: { text: string; email: string }) {
  const parts = text.split('{email}');
  return (
    <p>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <a href={`mailto:${email}`} className="break-all font-semibold underline underline-offset-4">
              {email}
            </a>
          )}
        </Fragment>
      ))}
    </p>
  );
}

export default async function PrivacyPage() {
  const { contact, site } = await getSiteContent();
  const { privacy } = site;
  return (
    <main id="main-content" className="public-shell">
      <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-16 sm:px-10 sm:pt-20">
        <header className="pb-12">
          <Eyebrow>{privacy.eyebrow}</Eyebrow>
          <h1 className="mt-6 font-display text-[44px] font-bold leading-none tracking-[-0.03em] sm:text-6xl lg:text-[80px]">
            {privacy.title}
          </h1>
          <p className="mt-6 max-w-[760px] text-xl font-medium leading-[1.3] sm:text-[26px]">
            {privacy.intro}
          </p>
        </header>

        {privacy.sections.map((sec) => (
          <Row key={sec.id} id={sec.id} title={sec.title}>
            {sec.paragraphs.map((para, i) => (
              <Paragraph key={i} text={para} email={contact.email} />
            ))}
          </Row>
        ))}
      </div>
    </main>
  );
}
