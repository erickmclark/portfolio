export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import SelectedWork from "@/components/selected-work";
import ContactBanner from "@/components/contact-banner";
import Reveal from "@/components/reveal";
import { getSiteContent } from "@/lib/content";
import { parseCategory, parseView } from "@/lib/home-view";

export async function generateMetadata(): Promise<Metadata> {
  const { home } = await getSiteContent();
  return {
    title: home.work.heading,
    description: home.work.intro,
    alternates: { canonical: "/work" },
  };
}

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const view = parseView(sp.view);
  const category = parseCategory(sp.category);

  return (
    <main id="main-content" className="public-shell">
      <SelectedWork view={view} category={category} />
      <Reveal><ContactBanner /></Reveal>
    </main>
  );
}
