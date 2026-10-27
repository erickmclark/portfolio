import { notFound, permanentRedirect } from "next/navigation";
import { getSiteContent, publicProjectBySlug } from "@/lib/content";
import { legacySlugRedirect } from "@/lib/home-view";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyProjectRedirect({ params }: Props) {
  const { slug } = await params;
  const project = publicProjectBySlug((await getSiteContent()).projects, slug);
  const to = project?.slug ?? legacySlugRedirect(slug);
  if (!to) notFound();
  permanentRedirect(`/work/${to}`);
}
