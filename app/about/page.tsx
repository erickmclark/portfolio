export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import Approach from "@/components/approach";
import About from "@/components/about";
import Experience from "@/components/experience";
import PointOfView from "@/components/point-of-view";
import ContactBanner from "@/components/contact-banner";
import HashScroll from "@/components/hash-scroll";
import Reveal from "@/components/reveal";
import { getSiteContent } from "@/lib/content";
import { parseView } from "@/lib/home-view";

export async function generateMetadata(): Promise<Metadata> {
  const { about, home } = await getSiteContent();
  return {
    title: home.about.heading,
    description: about.bio[0],
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const view = parseView(sp.view);

  return (
    <main id="main-content" className="public-shell">
      <HashScroll />
      <About level={1} />
      <Reveal><PointOfView /></Reveal>
      <Reveal><Approach view={view} /></Reveal>
      <Reveal><Experience /></Reveal>
      <Reveal><ContactBanner /></Reveal>
    </main>
  );
}
