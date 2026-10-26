export const dynamic = 'force-dynamic';

import Hero from "@/components/hero";
import Capabilities from "@/components/capabilities";
import SelectedWork from "@/components/selected-work";
import PointOfView from "@/components/point-of-view";
import AboutPreview from "@/components/about-preview";
import Contact from "@/components/contact";
import Reveal from "@/components/reveal";
import { parseCategory, parseView } from "@/lib/home-view";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const view = parseView(sp.view);
  const category = parseCategory(sp.category);

  return (
    <main id="main-content" className="public-shell">
      <Hero view={view} />
      <Reveal><Capabilities view={view} /></Reveal>
      <Reveal><SelectedWork view={view} category={category} preview /></Reveal>
      <Reveal><PointOfView /></Reveal>
      <Reveal><AboutPreview /></Reveal>
      <Reveal><Contact /></Reveal>
    </main>
  );
}
