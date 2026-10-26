import { getSiteContent, publicProjects } from "@/lib/content";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FACTORY_ID, filterByCategory, hasFactoryFeature, orderProjects, workHref, type View } from "@/lib/home-view";
import type { ProjectCategory } from "@/lib/types";
import SectionHead from "./section-head";
import WorkCard from "./work-card";
import WorkCategorySelect from "./work-category-select";

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

        {!preview && (
          <>
            <WorkCategorySelect view={view} category={category} />
            <p className="mt-4 border-b border-ink pb-4 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
              {category ?? "All work"} · ordered for the {home.viewLabels[view]} view
            </p>
          </>
        )}

        {list.length === 0 && <p className="mt-10 text-ink-muted">No public work in this category yet.</p>}

        {before.length > 0 && grid(before)}
        {feature && (
          <div className="mt-14">
            <WorkCard project={feature} feature priority={before.length === 0} />
          </div>
        )}
        {after.length > 0 && grid(after)}
        {preview && (
          <Link
            href={workHref(view)}
            className="mt-12 inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold underline underline-offset-4"
          >
            All work <ArrowRight size={14} aria-hidden />
          </Link>
        )}
      </div>
    </section>
  );
}
