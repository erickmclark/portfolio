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
      {/* Hero image */}
      <div className="relative w-full h-64 sm:h-80 bg-surface overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      <div className="max-w-site mx-auto px-6 py-12">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors duration-200 mb-10"
        >
          <ArrowLeft size={14} />
          Back to projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-3">
              {project.title}
            </h1>
            <p className="text-lg text-muted mb-8 leading-relaxed">{project.tagline}</p>
            <MarkdownRenderer content={project.description} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-accent hover:bg-accent-hover rounded-xl text-sm font-semibold text-white transition-colors duration-200">
                  <ExternalLink size={15} />
                  Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-border hover:border-accent/60 rounded-xl text-sm font-medium transition-colors duration-200">
                  <GitBranch size={15} />
                  View Source
                </a>
              )}
            </div>

            {/* Tech stack */}
            {project.tech.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-5">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-lg border border-border text-muted bg-background">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
