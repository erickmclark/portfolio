import { notFound, permanentRedirect } from "next/navigation";
import { getSiteContent, publicProjectBySlug } from "@/lib/content";
import { legacySlugRedirect } from "@/lib/home-view";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

// Resolves the slug before the [slug] loading boundary streams, so an unknown
// slug returns a real 404 (or 308) instead of a 200 shell.
export default async function CaseStudyLayout({ children, params }: Props) {
  const { slug } = await params;
  const project = publicProjectBySlug((await getSiteContent()).projects, slug);
  if (!project) {
    const to = legacySlugRedirect(slug);
    if (to) permanentRedirect(`/work/${to}`);
    notFound();
  }
  return children;
}
