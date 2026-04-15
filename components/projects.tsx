import { getSiteContent } from '@/lib/content';
import ProjectCard from './project-card';

export default function Projects() {
  const { projects } = getSiteContent();
  const sorted = [...projects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.order - b.order;
  });

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-site mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          Selected Work
        </p>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-12">
          Things I&apos;ve Built
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
