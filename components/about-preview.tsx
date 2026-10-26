import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSiteContent, publicExperience } from "@/lib/content";
import { experienceDates, splitAbout } from "@/lib/home-view";
import SectionHead, { Eyebrow } from "./section-head";

export default async function AboutPreview() {
  const { about, home, experience } = await getSiteContent();
  const ABOUT = home.about;
  const { closing } = splitAbout(about.bio);
  const recent = [...publicExperience(experience)].sort((a, b) => a.order - b.order).slice(0, 3);

  return (
    <section id="about-preview" aria-labelledby="about-preview-title" className="public-shell border-t border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
        <SectionHead eyebrow={ABOUT.eyebrow} heading={ABOUT.heading} headingId="about-preview-title" />
        <div className="mt-14 grid gap-12 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-[72px]">
          <div>
            {about.photo && (
              <Image
                src={about.photo}
                alt={`Portrait of ${about.name}`}
                width={160}
                height={160}
                sizes="160px"
                className="h-40 w-40 rounded-full object-cover ring-[3px] ring-brand-blue ring-offset-4 ring-offset-paper"
              />
            )}
            {closing && (
              <div className="mt-8 border-t-[3px] border-ink pt-5">
                <Eyebrow>{ABOUT.closingLabel}</Eyebrow>
                <p className="mt-4 font-display text-[32px] font-bold leading-[1.1] tracking-[-0.03em]">{closing}</p>
              </div>
            )}
          </div>
          <div>
            {recent.length > 0 && (
              <ol className="border-b border-ink">
                {recent.map((item) => (
                  <li key={item.id} className="grid gap-x-6 border-t border-ink py-4 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-display text-xl font-bold leading-tight tracking-[-0.03em]">{item.role}</p>
                      <p className="mt-1 text-[15px] text-ink-muted">{item.company}</p>
                    </div>
                    <p className="mt-2 font-mono text-xs font-medium uppercase tracking-[0.08em] sm:mt-1">
                      {experienceDates(item)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
            <Link
              href="/about"
              className="mt-6 inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold underline underline-offset-4"
            >
              More about me <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
