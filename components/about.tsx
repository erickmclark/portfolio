import Image from "next/image";
import { getSiteContent } from "@/lib/content";
import { splitAbout } from "@/lib/home-view";
import SectionHead, { Eyebrow } from "./section-head";

export default async function About({ level = 2 }: { level?: 1 | 2 }) {
  const { about, home } = await getSiteContent();
  const ABOUT = home.about;
  const { paragraphs, credentials, closing } = splitAbout(about.bio);

  return (
    <section id="about" aria-labelledby="about-title" className="public-shell border-t border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
        <SectionHead eyebrow={ABOUT.eyebrow} heading={ABOUT.heading} headingId="about-title" level={level} />
        <div className="mt-14 grid gap-12 lg:grid-cols-[420px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-[72px] lg:gap-y-0">
          {about.photo && (
            <figure className="flex flex-col items-center text-center lg:col-start-1 lg:row-start-1 lg:items-start lg:text-left">
              <Image
                src={about.photo}
                alt={`Portrait of ${about.name}`}
                width={160}
                height={160}
                sizes="160px"
                className="h-40 w-40 rounded-full object-cover ring-2 ring-brand-blue shadow-glow"
              />
              <blockquote className="mt-6 max-w-[34ch] text-[17px] italic leading-[1.5] text-ink-muted">
                “I’ve never been satisfied with just understanding how something works. I want to know how to make it better.”
              </blockquote>
            </figure>
          )}

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="space-y-5 text-[17px] leading-[1.5]">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          {closing && (
            <div className="border-t-[3px] border-ink pt-5 lg:col-start-1 lg:row-start-2 lg:mt-8">
              <Eyebrow>{ABOUT.closingLabel}</Eyebrow>
              <p className="mt-4 font-display text-[32px] font-bold leading-[1.1] tracking-[-0.03em]">{closing}</p>
            </div>
          )}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-[72px]">
          {credentials.length > 0 && (
            <div>
              <Eyebrow>Credentials</Eyebrow>
              <ul className="mt-3 border-b border-ink">
                {credentials.map((c) => (
                  <li key={c} className="border-t border-ink py-3 text-[15px]">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Disclosure: closed by default, content stays in the HTML for search engines and no-JS visitors. */}
          <details className="group self-start border-y border-ink lg:mt-[0px]">
            <summary className="flex min-h-14 cursor-pointer items-center justify-between">
              <Eyebrow>Technical toolkit</Eyebrow>
              <span className="text-[15px] font-semibold">
                <span className="group-open:hidden">Show toolkit ▾</span>
                <span className="hidden group-open:inline">Hide toolkit ▴</span>
              </span>
            </summary>
            <dl className="pb-4">
              {home.toolkit.map((g) => (
                <div key={g.group} className="grid gap-2 border-t border-ink py-4 sm:grid-cols-[170px_1fr] sm:gap-6">
                  <dt className="text-[15px] font-semibold">{g.group}</dt>
                  <dd>
                    <ul className="flex flex-wrap gap-2">
                      {g.items.map((t) => (
                        <li key={t} className="border border-ink px-2.5 py-1 text-sm">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      </div>
    </section>
  );
}
