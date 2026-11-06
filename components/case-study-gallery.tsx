import type { ProjectImage } from "@/lib/types";
import ImageLightbox from "@/components/image-lightbox";

export default function CaseStudyGallery({ images, title }: { images: ProjectImage[]; title: string }) {
  if (images.length === 0) return null;
  return (
    <section aria-label={`${title} images`} className="mx-auto mt-12 max-w-[1440px] px-4 sm:px-10">
      <ImageLightbox images={images} title={title} />
    </section>
  );
}
