import { getSiteContent, publicProjects } from "@/lib/content";
import { WORK } from "@/lib/home-copy";
import { VIEW_LABELS, FACTORY_ID, filterByCategory, hasFactoryFeature, orderProjects, type View } from "@/lib/home-view";
import type { ProjectCategory } from "@/lib/types";
import SectionHead from "./section-head";
import WorkCard from "./work-card";
import WorkCategorySelect from "./work-category-select";

export default async function SelectedWork({ view, category }: { view: View; category: ProjectCategory | null }) {
  const { projects } = await getSiteContent();
  const list = filterByCategory(orderProjects(publicProjects(projects), view), category);
  const fi = hasFactoryFeature(view) ? list.findIndex((p) => p.id === FACTORY_ID) : -1;
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
        <SectionHead eyebrow={WORK.eyebrow} heading={WORK.heading} lede={WORK.intro} headingId="work-title" />

        <WorkCategorySelect view={view} category={category} />
        <p className="mt-4 border-b border-ink pb-4 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
          {category ?? "All work"} · ordered for the {VIEW_LABELS[view]} view
        </p>

        {list.length === 0 && <p className="mt-10 text-ink-muted">No public work in this category yet.</p>}

        {before.length > 0 && grid(before)}
        {feature && (
          <div className="mt-14">
            <WorkCard project={feature} feature priority={before.length === 0} />
          </div>
        )}
        {after.length > 0 && grid(after)}
      </div>
    </section>
  );
}
