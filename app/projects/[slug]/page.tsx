import { notFound, permanentRedirect } from "next/navigation";
import { getSiteContent, publicProjectBySlug } from "@/lib/content";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyProjectRedirect({ params }: Props) {
  const { slug } = await params;
  const project = publicProjectBySlug((await getSiteContent()).projects, slug);
  if (!project) notFound();
  permanentRedirect(`/work/${project.slug}`);
}
