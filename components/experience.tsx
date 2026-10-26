import { Download } from "lucide-react";
import { getSiteContent, publicExperience } from "@/lib/content";
import { EXPERIENCE } from "@/lib/home-copy";
import { experienceDates } from "@/lib/home-view";
import SectionHead from "./section-head";

const MARKS = ["bg-brand-blue", "bg-brand-orange", "bg-brand-yellow", "bg-brand-green", "bg-brand-pink", "bg-ink", "bg-brand-sky"];

export default async function Experience() {
  const { experience, about } = await getSiteContent();
  const items = [...publicExperience(experience)].sort((a, b) => a.order - b.order);
  if (items.length === 0) return null;

  return (
    <section id="experience" aria-labelledby="exp-title" className="public-shell border-t border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
        <SectionHead eyebrow={EXPERIENCE.eyebrow} heading={EXPERIENCE.heading} headingId="exp-title" />
        <ol className="mt-12 border-b border-ink">
          {items.map((item, i) => (
            <li key={item.id} className="grid gap-x-6 border-t border-ink py-5 sm:grid-cols-[1fr_auto]">
              <div className="flex gap-6">
                <span className={`mt-2 h-3 w-3 shrink-0 ${MARKS[i % MARKS.length]}`} aria-hidden />
                <div>
                  <h3 className="font-display text-xl font-bold leading-tight tracking-[-0.03em] sm:text-2xl">{item.role}</h3>
                  <p className="mt-1 text-[15px] text-ink-muted">{item.company}</p>
                  {item.description && <p className="mt-2 max-w-[900px] text-[15px] leading-normal text-ink-muted">{item.description}</p>}
                </div>
              </div>
              <p className="mt-2 pl-9 font-mono text-xs font-medium uppercase tracking-[0.08em] sm:mt-1 sm:pl-0">
                {experienceDates(item)}
              </p>
            </li>
          ))}
        </ol>
        {about.resumeUrl && (
          <a
            href={about.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 border-2 border-ink px-5 text-[15px] font-semibold hover:bg-white"
          >
            {EXPERIENCE.cta} <Download size={14} aria-hidden />
          </a>
        )}
      </div>
    </section>
  );
}
