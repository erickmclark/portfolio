import { notFound } from "next/navigation";
import { ArrowLeft, GitBranch, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import MarkdownRenderer from "@/components/markdown-renderer";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getSiteContent().projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getSiteContent().projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    openGraph: {
      title: project.title,
      description: project.tagline,
      images: [{ url: project.image }],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getSiteContent().projects.find((p) => p.slug === slug);
  if (!project) return notFound();

  return (
    <main className="pt-[72px]">
      <div className="relative w-full h-64 sm:h-80 bg-surface overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      <div className="max-w-site mx-auto px-6 py-16">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors duration-200 mb-8"
        >
          <ArrowLeft size={14} />
          Back to projects
        </Link>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">
          {project.title}
        </h1>
        <p className="text-lg text-muted mb-6">{project.tagline}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tech.map((t) => (
            <span key={t} className="text-xs font-medium px-3 py-1 rounded-full border border-border text-muted">
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 mb-12">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:border-accent rounded-lg text-sm font-medium transition-colors duration-200">
              <GitBranch size={16} />
              View on GitHub
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg text-sm font-medium text-white transition-colors duration-200">
              <ExternalLink size={16} />
              Live Demo
            </a>
          )}
        </div>
        <div className="max-w-2xl">
          <MarkdownRenderer content={project.description} />
        </div>
      </div>
    </main>
  );
}
