import { getSiteContent, publicProjects } from "@/lib/content";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FACTORY_ID, filterByCategory, groupByCategory, hasFactoryFeature, orderProjects, workHref, type View } from "@/lib/home-view";
import type { ProjectCategory } from "@/lib/types";
import SectionHead from "./section-head";
import WorkCard from "./work-card";

const PREVIEW_COUNT = 3;

export default async function SelectedWork({
  view,
  category,
  preview = false,
}: {
  view: View;
  category: ProjectCategory | null;
  preview?: boolean;
}) {
  const { projects, home } = await getSiteContent();
  const WORK = home.work;
  if (!preview) {
    const groups = groupByCategory(orderProjects(publicProjects(projects), view, home.workOrder));
    const factoryFeature = hasFactoryFeature(view, home.workOrder);
    return (
      <section id="work" aria-labelledby="work-title" className="public-shell border-t border-ink">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
          <SectionHead eyebrow={WORK.eyebrow} heading={WORK.heading} lede={WORK.intro} headingId="work-title" level={1} />

          {groups.length === 0 ? (
            <p className="mt-10 text-ink-muted">No public work yet.</p>
          ) : (
            <>
              <nav aria-label="Jump to category" className="mt-10 border-b border-ink pb-6">
                <ul className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em]">
                  {groups.map((g) => (
                    <li key={g.id}>
                      <a href={`#${g.id}`} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                        {g.label} ({g.projects.length})
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              {groups.map((g, gi) => (
                <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-6 border-b border-ink py-14 lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
                  <header className="lg:sticky lg:top-24 lg:self-start">
                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
                      {g.projects.length} {g.projects.length === 1 ? "project" : "projects"}
                    </p>
                    <h2 id={`${g.id}-title`} className="mt-2 font-display text-2xl font-bold leading-tight tracking-[-0.03em]">
                      {g.label}
                    </h2>
                  </header>
                  <ul className={`mt-8 lg:mt-0 ${g.projects.length === 1 ? "" : "grid gap-x-8 gap-y-16 lg:grid-cols-2"}`}>
                    {g.projects.map((p, pi) => (
                      <li key={p.id}>
                        <WorkCard project={p} wide={g.projects.length === 1} featuredLabel={factoryFeature && p.id === FACTORY_ID} priority={gi === 0 && pi === 0} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </>
          )}
        </div>
      </section>
    );
  }
  const ordered = filterByCategory(orderProjects(publicProjects(projects), view, home.workOrder), category);
  const list = preview ? ordered.slice(0, PREVIEW_COUNT) : ordered;
  const fi = hasFactoryFeature(view, home.workOrder) ? list.findIndex((p) => p.id === FACTORY_ID) : -1;
  const feature = fi === -1 ? null : list[fi];
  const before = fi === -1 ? list : list.slice(0, fi);
  const after = fi === -1 ? [] : list.slice(fi + 1);
  const grid = (items: typeof list) => (
    <ul className="mt-14 grid gap-x-8 gap-y-16 lg:grid-cols-2">
      {items.map((p) => (
        <li key={p.id}>
          <WorkCard project={p} />
        </li>
      ))}
    </ul>
  );

  return (
    <section id="work" aria-labelledby="work-title" className="public-shell border-t border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
        <SectionHead eyebrow={WORK.eyebrow} heading={WORK.heading} lede={WORK.intro} headingId="work-title" level={preview ? 2 : 1} />


        {list.length === 0 && <p className="mt-10 text-ink-muted">No public work in this category yet.</p>}

        {before.length > 0 && grid(before)}
        {feature && (
          <div className="mt-14">
            <WorkCard project={feature} wide featuredLabel priority={before.length === 0} />
          </div>
        )}
        {after.length > 0 && grid(after)}
        {preview && (
          <Link
            href={workHref(view)}
            className="mt-12 inline-flex min-h-11 items-center gap-1 rounded-full border-2 border-ink px-5 text-[15px] font-semibold hover:bg-white"
          >
            All work <ArrowRight size={14} aria-hidden />
          </Link>
        )}
      </div>
    </section>
  );
}
