import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getSiteContent, publicProjectBySlug, publicProjects } from "@/lib/content";
import { FACTORY_ID, displayStatus, externalHref, type View } from "@/lib/home-view";
import type { CaseStudySection, ProjectImage } from "@/lib/types";
import CaseStudyGallery from "@/components/case-study-gallery";
import CaseStudySectionBlock from "@/components/case-study-section";
import Configuration from "@/components/configuration";
import CaseStudyFooter from "@/components/case-study-footer";
import ScrollReset from "@/components/scroll-reset";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

// Only the Factory has a designed configuration (Figma 128:2, Builder). Others get none.
const CONFIGURATION_VIEW: Record<string, View> = { [FACTORY_ID]: "builder" };

const SECTIONS: { key: CaseStudySection; title: string; numbered: boolean }[] = [
  { key: "intro", title: "Overview", numbered: false },
  { key: "challenge", title: "The challenge", numbered: true },
  { key: "responsibility", title: "My responsibility", numbered: true },
  { key: "keyDecisions", title: "Key decisions", numbered: true },
  { key: "delivered", title: "What I delivered", numbered: true },
  { key: "howItWorks", title: "How it works", numbered: true },
  { key: "riskAndControls", title: "Risk and controls", numbered: true },
  { key: "outcome", title: "Outcome and evidence", numbered: true },
  { key: "learned", title: "What I learned / would improve", numbered: true },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = publicProjectBySlug((await getSiteContent()).projects, slug);
  if (!project) return {};
  const title = project.category
    ? `${project.title} | Erick Clark — ${project.category}`
    : `${project.title} | Erick Clark`;
  return {
    title: { absolute: title },
    description: project.tagline,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title, description: project.tagline, url: `/work/${project.slug}` },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const { projects, home } = await getSiteContent();
  const project = publicProjectBySlug(projects, slug);
  if (!project) notFound();

  const pub = publicProjects(projects);
  const idx = pub.findIndex((p) => p.id === project.id);
  const next = pub.length > 1 ? pub[(idx + 1) % pub.length] : undefined;

  const cs = project.caseStudy ?? {};
  const status = displayStatus(project);
  const ext = externalHref(project);
  const images: ProjectImage[] =
    project.images && project.images.length > 0
      ? project.images
      : project.image
        ? [{ url: project.image, alt: `${project.title} screenshot`, kind: "screenshot" }]
        : [];

  const configView = CONFIGURATION_VIEW[project.id];
  const eyebrow = [project.category, project.relationship].filter(Boolean).join(" · ");
  const meta: [string, React.ReactNode][] = [
    ["Category", project.category],
    ["Relationship", project.relationship],
    ["Role", cs.role?.trim()],
    [
      "Status",
      status && (
        <span className="inline-block border border-ink px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em]">
          {status}
        </span>
      ),
    ],
    ["Date", cs.dates?.trim()],
  ];

  const shown = SECTIONS.filter((s) => cs[s.key]?.trim());
  const overview = shown.length === 0 ? project.description?.trim() : undefined;
  let n = 0;

  return (
    <main id="main-content" className="public-shell">
      <ScrollReset />
      <div className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-10">
        <Link href="/work" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">
          <ArrowLeft size={14} aria-hidden /> All work
        </Link>
        <div className={configView ? "lg:grid lg:grid-cols-[1fr_440px] lg:items-start lg:gap-12" : ""}>
          <div>
            {eyebrow && (
              <p className="mt-4 font-mono text-[11px] font-medium uppercase tracking-[0.1em]">{eyebrow}</p>
            )}
            <h1 className="mt-4 max-w-[1000px] font-display text-[40px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[80px]">
              {project.title}
            </h1>
            <p className="mt-5 max-w-[760px] text-xl font-medium leading-[1.3] sm:text-[26px]">{project.tagline}</p>

          </div>
          {configView && (
            <div className="hidden lg:block">
              <Configuration view={configView} capabilities={home.capabilities[configView]} />
            </div>
          )}
        </div>

        <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-ink pt-4 sm:grid-cols-3 lg:grid-cols-5">
          {meta
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">{k}</dt>
                <dd className="mt-1 text-sm font-medium">{v}</dd>
              </div>
            ))}
        </dl>

        {ext && (
          <a
            href={ext}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold underline underline-offset-4"
          >
            Visit site<span className="sr-only"> for {project.title} (opens in a new tab)</span>{" "}
            <ArrowUpRight size={14} aria-hidden />
          </a>
        )}
      </div>

      <CaseStudyGallery images={images} title={project.title} />

      <div className="mt-12">
        {overview && <CaseStudySectionBlock id="cs-intro" title="Overview" body={overview} />}
        {shown.map((s) => (
          <CaseStudySectionBlock
            key={s.key}
            id={`cs-${s.key}`}
            title={s.title}
            number={s.numbered ? String(++n).padStart(2, "0") : undefined}
            body={cs[s.key] as string}
          />
        ))}
        <CaseStudyFooter project={project} next={next} />
      </div>
    </main>
  );
}
