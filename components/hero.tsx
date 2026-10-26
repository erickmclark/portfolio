import Image from "next/image";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { getSiteContent } from "@/lib/content";
import { formatCredentials } from "@/lib/credentials";
import { VIEWS, homeHref, type View } from "@/lib/home-view";
import Configuration from "./configuration";
import { ConfigurationMotion, ViewFade } from "./hero-motion";
import { Eyebrow } from "./section-head";
import ViewToggle from "./view-toggle";

const VIEW_TOWER: Record<View, string> = {
  it: "IT Professional (tower)",
  consultant: "Consultant (tower)",
  builder: "Builder (tower)",
};

export default async function Hero({ view }: { view: View }) {
  const { about, home } = await getSiteContent();
  const credentials = formatCredentials(about.credentials);
  const copy = home.hero[view];
  const btn =
    "inline-flex min-h-11 items-center justify-center px-5 text-[15px] font-semibold";

  const resolve = (href: string) => (href === "resume" ? about.resumeUrl ?? null : href);
  const primary = resolve(copy.primary.href);
  const secondary = resolve(copy.secondary.href);

  return (
    <section id="top" aria-labelledby="hero-title" className="public-shell">
      <div className="mx-auto grid max-w-[1440px] gap-x-24 gap-y-8 px-4 pb-14 pt-8 sm:px-10 sm:pt-14 lg:grid-cols-[minmax(0,652px)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
        <div className="lg:col-start-1 lg:row-start-1">
          <div className="flex items-center gap-4">
            {about.photo && (
              <Image
                src={about.photo}
                alt={`Portrait of ${about.name}`}
                width={64}
                height={64}
                priority
                className="h-16 w-16 rounded-full object-cover ring-[3px] ring-brand-blue ring-offset-[3px] ring-offset-paper"
              />
            )}
            <div>
              <p className="font-display text-lg font-bold tracking-[-0.02em]">{about.name}</p>
              {credentials && (
                <p className="mt-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">{credentials}</p>
              )}
              <p className="text-sm text-ink-muted">{home.profileLine}</p>
            </div>
          </div>

          <Eyebrow className="mt-8">{home.selectorLabel}</Eyebrow>
          <ViewToggle view={view} items={VIEWS.map((v) => ({ view: v, label: home.viewLabels[v], href: homeHref(v) }))} />
        </div>

        <ViewFade view={view} className="order-3 lg:order-none lg:col-start-1 lg:row-start-2">
          {/* The H1 is the page's only H1 and is server-rendered for every view. */}
          <h1
            id="hero-title"
            className="mt-0 max-w-[640px] font-display text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-ink sm:text-[56px] sm:tracking-[-0.03em]"
          >
            {copy.h1}
          </h1>
          <p className="mt-5 max-w-[600px] text-[17px] leading-[1.55] text-ink-muted">{copy.body}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={primary ?? "#work"}
              className={`on-dark ${btn} rounded-full bg-ink text-white`}
              {...(copy.primary.href === "resume" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {copy.primary.label}
            </a>
            {secondary && (
              <a
                href={secondary}
                className={`${btn} gap-2 rounded-full border-2 border-ink text-ink hover:bg-white`}
                {...(copy.secondary.href === "resume" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {copy.secondary.label}
                {copy.secondary.href === "resume" && <Download size={14} aria-hidden />}
              </a>
            )}
            {copy.tertiary && (
              <a
                href={copy.tertiary.href}
                className={`${btn} gap-1 px-1 underline underline-offset-4`}
                {...(copy.tertiaryExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {copy.tertiary.label}
                {copy.tertiaryExternal ? <ArrowUpRight size={14} aria-hidden /> : <ArrowRight size={14} aria-hidden />}
              </a>
            )}
          </div>
        </ViewFade>

        <div className="order-2 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-14">
          <ConfigurationMotion view={view}>
            <Configuration view={view} capabilities={home.capabilities[view]} className="mx-auto max-w-[600px] lg:ml-auto" />
          </ConfigurationMotion>
          <p className="mx-auto mt-3 max-w-[600px] text-right font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted lg:ml-auto">
            Configuration: {VIEW_TOWER[view]}
          </p>
          <span className="sr-only">
            Seven capabilities in priority order: {home.capabilities[view].map((c) => c.title).join(", ")}.
          </span>
        </div>
      </div>
    </section>
  );
}
