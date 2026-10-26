export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/content';
import { Eyebrow } from '@/components/section-head';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How the contact form and analytics on this site handle your information.',
  alternates: { canonical: '/privacy' },
  robots: { index: false, follow: false },
};

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

export default async function PrivacyPage() {
  const { contact } = await getSiteContent();
  return (
    <main id="main-content" className="public-shell">
      <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-16 sm:px-10 sm:pt-20">
        <header className="pb-12">
          <Eyebrow>Draft</Eyebrow>
          <h1 className="mt-6 font-display text-[44px] font-bold leading-none tracking-[-0.03em] sm:text-6xl lg:text-[80px]">
            Privacy Policy
          </h1>
          <p className="mt-6 max-w-[760px] text-xl font-medium leading-[1.3] sm:text-[26px]">
            How the contact form and analytics on this site handle your information.
          </p>
        </header>

        <Row id="operator" title="Who operates this site">
          <p>This site is operated by Erick Clark.</p>
        </Row>

        <Row id="collected" title="What the contact form collects">
          <p>
            Your name and email address, the type of inquiry you choose, and your answers to that inquiry
            type&apos;s questions. Depending on the type, these can include your organization, role or project
            details, links you add, budget, timeframe and similar business details you choose to enter.
          </p>
          <p>
            Each message also includes the inquiry type, the page you sent it from, the audience view you were
            reading, the time it was received, and the version of the privacy acknowledgment you accepted.
          </p>
          <p>
            The site does not store submissions in a database. Each one is sent as an email, and the message
            then exists in the recipient&apos;s mailbox and with the email provider.
          </p>
        </Row>

        <Row id="use" title="How your information is used and where it goes">
          <p>To understand your request and reply to it, using the email address you provide.</p>
          <p>
            Leadership opportunity, product or partnership, and general inquiries go to Erick directly.
            Strategic advisory, build-a-product, and speaking or training inquiries go to his Clark Strategics
            business inbox. Commercial inquiries of these kinds may be handled through Clark Strategic Systems
            LLC.
          </p>
        </Row>

        <Row id="providers" title="Service providers">
          <p>Contact form messages are delivered by email through Resend.</p>
          <p>
            To limit abuse, the form keeps short-lived counters in a Redis database. Counters are keyed to a
            one-way hash of your IP address, not the address itself. The form also uses a hidden field and a
            minimum-time check to filter automated submissions.
          </p>
          <p>The site is hosted on Vercel.</p>
        </Row>

        <Row id="cookies" title="Cookies and analytics">
          <p>
            The site includes Vercel Web Analytics and Vercel Speed Insights to measure aggregate traffic and
            page performance. Vercel documents that Web Analytics uses no third-party cookies and identifies
            visitors by a hash created from the incoming request, and that Speed Insights data is not tied to an
            individual visitor or IP address. Data points include page URL, referrer, approximate location,
            browser, operating system and device type.
          </p>
          <p>
            The site itself does not set cookies for visitors. A sign-in cookie exists only for the site
            owner&apos;s administrative area.
          </p>
        </Row>

        <Row id="sensitive" title="Health and sensitive information">
          <p>
            The contact form does not ask for health information. Please do not include protected health
            information, passwords, government IDs or confidential business documents in a message.
          </p>
        </Row>

        <Row id="contact" title="Privacy requests">
          <p>
            For questions about this policy or about information you have sent through the site, email{' '}
            <a href={`mailto:${contact.email}`} className="break-all font-semibold underline underline-offset-4">
              {contact.email}
            </a>
            .
          </p>
        </Row>
      </div>
    </main>
  );
}
