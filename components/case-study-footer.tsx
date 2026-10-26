import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { CONTACT_HREFS, FACTORY_SECOND_CTA } from "@/lib/home-copy";

export default function CaseStudyFooter({ project, next }: { project: Project; next?: Project }) {
  const cta =
    project.id === "prj-ai-engineering-factory"
      ? FACTORY_SECOND_CTA
      : { label: "Get in touch", href: CONTACT_HREFS.general };
  return (
    <section aria-label="Next steps" className="border-t border-ink py-10 sm:py-14">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:px-10 lg:grid-cols-2">
        {next ? (
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">Next project</p>
            <Link
              href={`/work/${next.slug}`}
              className="mt-2 inline-flex min-h-11 items-center gap-2 font-display text-2xl font-bold tracking-[-0.03em] underline-offset-4 hover:underline"
            >
              {next.title} <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        ) : (
          <div />
        )}
        <div>
          <a
            href={cta.href}
            className="inline-flex min-h-11 items-center gap-2 bg-ink px-5 text-[15px] font-semibold text-white"
          >
            {cta.label} <ArrowRight size={14} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
