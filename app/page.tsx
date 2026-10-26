export const dynamic = 'force-dynamic';

import Hero from "@/components/hero";
import Capabilities from "@/components/capabilities";
import Approach from "@/components/approach";
import SelectedWork from "@/components/selected-work";
import PointOfView from "@/components/point-of-view";
import About from "@/components/about";
import Experience from "@/components/experience";
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
      <Approach />
      <Reveal><SelectedWork view={view} category={category} /></Reveal>
      <Reveal><PointOfView /></Reveal>
      <Reveal><About /></Reveal>
      <Reveal><Experience /></Reveal>
      <Reveal><Contact /></Reveal>
    </main>
  );
}
