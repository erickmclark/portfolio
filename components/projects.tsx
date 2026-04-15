import { getSiteContent } from '@/lib/content';
import ProjectCard from './project-card';

export default async function Projects() {
  const { projects } = await getSiteContent();
  const sorted = [...projects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.order - b.order;
  });

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-site mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">
              Selected Work
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter">
              Things I&apos;ve Built
            </h2>
          </div>
          <p className="text-muted text-sm shrink-0">
            {sorted.length} project{sorted.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
