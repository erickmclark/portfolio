import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PERSPECTIVES } from "@/lib/home-copy";
import { homeHref } from "@/lib/home-view";
import Configuration from "./configuration";
import SectionHead from "./section-head";

export default function Perspectives() {
  return (
    <section id="perspectives" aria-labelledby="persp-title" className="public-shell border-t border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
        <SectionHead eyebrow={PERSPECTIVES.eyebrow} heading={PERSPECTIVES.heading} lede={PERSPECTIVES.sub} headingId="persp-title" />
        <ul className="mt-12 grid items-start gap-6 lg:grid-cols-3">
          {PERSPECTIVES.cards.map((c) => (
            <li key={c.view} className="border border-ink p-6">
              <Configuration view={c.view} labels={false} />
              <h3 className="mt-6 font-display text-[28px] font-bold leading-none tracking-[-0.04em]">{c.title}</h3>
              <p className="mt-3 text-[15px] text-ink-muted">{c.line}</p>
              <p className="mt-3 text-[15px] leading-normal text-ink-muted">{c.detail}</p>
              <Link
                href={homeHref(c.view, null, "work")}
                className="mt-3 inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold underline underline-offset-4"
              >
                {c.cta} <ArrowRight size={14} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
