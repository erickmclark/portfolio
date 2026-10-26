import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { displayStatus, externalHref } from "@/lib/home-view";
import { defaultCardCtas } from "@/lib/home-copy";

const TILE_TONE: Record<string, string> = {
  "Enterprise Leadership": "bg-brand-blue text-white",
  "Web & App Development": "bg-brand-green text-white",
  "AI & SaaS Products": "bg-brand-orange text-ink",
  "AI Engineering Systems": "bg-brand-yellow text-ink",
  "AI Strategy & Governance": "bg-brand-navy text-white",
};

function media(project: Project) {
  const first = project.images?.[0];
  if (first?.url) return { src: first.url, alt: first.alt, conceptual: first.kind === "conceptual" };
  if (project.image) return { src: project.image, alt: `${project.title} screenshot`, conceptual: false };
  return null;
}

export default function WorkCard({ project, feature = false, priority = false }: { project: Project; feature?: boolean; priority?: boolean }) {
  const m = media(project);
  const status = displayStatus(project);
  const ext = externalHref(project);
  const dates = project.caseStudy?.dates;
  const card = project.cardCta ?? defaultCardCtas(project.id).cardCta!;
  const contactCta = card.href ? { label: card.label, href: card.href } : undefined;
  const cta = card.label;
  const meta = [project.category, project.relationship, dates].filter(Boolean);

  return (
    <article className={feature ? "grid gap-8 lg:grid-cols-[1fr_1.1fr]" : ""}>
      <div className={feature ? "lg:col-span-2" : ""}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] font-medium uppercase tracking-[0.1em]">
          {feature && <span>Featured</span>}
          {meta.map((x) => (
            <span key={x}>{x}</span>
          ))}
          {status && <span className="border border-ink px-2 py-0.5">{status}</span>}
        </div>
      </div>

      <div className={feature ? "" : "mt-4"}>
        <div className="relative aspect-[16/10] w-full overflow-hidden border border-ink bg-white">
          {m ? (
            <Image
              src={m.src}
              alt={m.alt}
              fill
              sizes={feature ? "(min-width:1024px) 55vw, 100vw" : "(min-width:1024px) 664px, 100vw"}
              priority={priority}
              className="object-cover object-top"
            />
          ) : (
            <div className={`flex h-full w-full items-end p-5 ${TILE_TONE[project.category ?? ""] ?? "bg-ink text-white"}`} aria-hidden>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.1em]">{project.category}</span>
            </div>
          )}
          {m?.conceptual && (
            <span className="absolute left-2 top-2 bg-brand-cream px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink">
              Conceptual illustration
            </span>
          )}
        </div>
      </div>

      <div className={feature ? "" : "mt-5"}>
        <h3
          className={`font-display font-bold leading-none tracking-[-0.045em] ${
            feature ? "text-[40px] sm:text-5xl" : "text-[28px] sm:text-[32px]"
          }`}
        >
          {project.title}
        </h3>
        <p className="mt-3 max-w-[620px] text-[15px] leading-normal text-ink-muted">{project.tagline}</p>

        {project.tech.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technology">
            {project.tech.map((t) => (
              <li key={t} className="border border-ink px-2.5 py-1 text-xs">
                {t}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-5">
          {contactCta ? (
            <a href={contactCta.href} className="inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold underline underline-offset-4">
              {contactCta.label} <ArrowRight size={14} aria-hidden />
            </a>
          ) : (
            <Link href={`/projects/${project.slug}`} className="inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold underline underline-offset-4">
              {cta}
              <span className="sr-only">: {project.title}</span> <ArrowRight size={14} aria-hidden />
            </Link>
          )}
          {project.cardSecondaryCta && (
            <a href={project.cardSecondaryCta.href} className="inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold underline underline-offset-4">
              {project.cardSecondaryCta.label} <ArrowRight size={14} aria-hidden />
            </a>
          )}
          {ext && (
            <a
              href={ext}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold underline underline-offset-4"
            >
              Visit site<span className="sr-only"> for {project.title} (opens in a new tab)</span> <ArrowUpRight size={14} aria-hidden />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
