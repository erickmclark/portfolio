export const dynamic = 'force-dynamic';

import Hero from "@/components/hero";
import Capabilities from "@/components/capabilities";
import Approach from "@/components/approach";
import Perspectives from "@/components/perspectives";
import SelectedWork from "@/components/selected-work";
import PointOfView from "@/components/point-of-view";
import About from "@/components/about";
import Experience from "@/components/experience";
import Contact from "@/components/contact";
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
      <Capabilities view={view} />
      <Approach view={view} />
      <Perspectives />
      <SelectedWork view={view} category={category} />
      <PointOfView />
      <About />
      <Experience />
      <Contact />
    </main>
  );
}
