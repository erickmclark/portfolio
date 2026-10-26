export const dynamic = 'force-dynamic';

import Hero from "@/components/hero";
import ScrollReset from "@/components/scroll-reset";
import Capabilities from "@/components/capabilities";
import SelectedWork from "@/components/selected-work";
import AboutPreview from "@/components/about-preview";
import ContactBanner from "@/components/contact-banner";
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
      <ScrollReset />
      <Hero view={view} />
      <Reveal><Capabilities view={view} /></Reveal>
      <Reveal><SelectedWork view={view} category={category} preview /></Reveal>
      <Reveal><AboutPreview /></Reveal>
      <Reveal><ContactBanner id="contact" /></Reveal>
    </main>
  );
}
