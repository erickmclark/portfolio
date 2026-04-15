import Link from "next/link";
import Image from "next/image";
import { GitBranch, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/types";

type Props = {
  project: Project;
};

export default function ProjectCard({ project }: Props) {
  return (
    <div className="group relative bg-surface border border-border rounded-xl overflow-hidden hover:border-accent transition-colors duration-200">
      {/* Image */}
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative w-full aspect-video bg-border overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-6">
        {/* Tech tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-xs font-medium px-2 py-1 rounded-md bg-background text-muted border border-border"
            >
              {t}
            </span>
          ))}
        </div>

        <Link href={`/projects/${project.slug}`}>
          <h3 className="text-lg font-bold mb-1 hover:text-accent transition-colors duration-200">
            {project.title}
          </h3>
        </Link>
        <p className="text-sm text-muted mb-4 leading-relaxed">
          {project.tagline}
        </p>

        {/* Links */}
        <div className="flex items-center gap-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors duration-200"
            >
              <GitBranch size={14} />
              GitHub
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors duration-200"
            >
              <ExternalLink size={14} />
              Live
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
