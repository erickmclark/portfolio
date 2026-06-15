import Link from "next/link";
import { GitBranch, ExternalLink, ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";
import ProjectImage from "@/components/project-image";

type Props = {
  project: Project;
};

export default function ProjectCard({ project }: Props) {
  return (
    <div className="group relative bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5">
      {/* Image */}
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative w-full aspect-video bg-border overflow-hidden">
          <ProjectImage
            src={project.image}
            alt={project.title}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Hover overlay with arrow */}
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <ArrowUpRight size={18} className="text-white" />
            </div>
          </div>
          {project.featured && (
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-accent/90 text-white text-xs font-semibold backdrop-blur-sm">
              Featured
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.tech.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded-md bg-background text-muted border border-border"
            >
              {t}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-background text-muted border border-border">
              +{project.tech.length - 4}
            </span>
          )}
        </div>

        <Link href={`/projects/${project.slug}`}>
          <h3 className="text-base font-bold mb-1 group-hover:text-accent transition-colors duration-200">
            {project.title}
          </h3>
        </Link>
        <p className="text-sm text-muted mb-4 leading-relaxed line-clamp-2">
          {project.tagline}
        </p>

        {/* Links */}
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors duration-200"
            >
              <GitBranch size={13} />
              Source
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors duration-200 ml-auto"
            >
              Live Demo
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
