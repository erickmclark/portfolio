import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSiteContent } from "@/lib/content";
import { workHref, type View } from "@/lib/home-view";
import ApproachAssembly from "./approach-assembly";
import Configuration from "./configuration";
import SectionHead from "./section-head";

export default async function Approach({ view }: { view: View }) {
  const { home } = await getSiteContent();
  const APPROACH = home.approach;
  return (
    <section id="approach" aria-labelledby="approach-title" className="public-shell border-t border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
        <SectionHead eyebrow={APPROACH.eyebrow} heading={APPROACH.heading} lede={APPROACH.intro} headingId="approach-title" level={1} />
        <ApproachAssembly view={view}>
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,602px)_minmax(0,1fr)] lg:gap-[72px]">
          <div>
            <ol>
              {APPROACH.steps.map((s, i) => (
                <li key={s.title} data-step className="border-t border-ink py-6">
                  <p className="font-mono text-[11px] font-medium">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 font-display text-[32px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[40px]">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-normal text-ink-muted">{s.body}</p>
                </li>
              ))}
            </ol>
            <Link href={workHref(view)} className="inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold underline underline-offset-4">
              {APPROACH.cta} <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
          <div className="hidden self-center border border-ink p-10 lg:block">
            <Configuration view={view} capabilities={home.capabilities[view]} labels={false} />
          </div>
        </div>
        </ApproachAssembly>
      </div>
    </section>
  );
}
