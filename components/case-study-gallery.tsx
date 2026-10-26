import Image from "next/image";
import type { ProjectImage } from "@/lib/types";

export default function CaseStudyGallery({ images, title }: { images: ProjectImage[]; title: string }) {
  if (images.length === 0) return null;
  return (
    <section aria-label={`${title} images`} className="mx-auto mt-12 max-w-[1440px] px-4 sm:px-10">
      <ul className="space-y-8">
        {images.map((img, i) => (
          <li key={`${img.url}-${i}`}>
            <figure>
              <div className="relative w-full overflow-hidden border border-ink bg-white">
                <Image
                  src={img.url}
                  alt={img.alt}
                  width={1600}
                  height={1000}
                  sizes="(min-width:1440px) 1360px, 100vw"
                  priority={i === 0}
                  className="h-auto w-full"
                />
                {img.kind === "conceptual" && (
                  <span className="absolute left-2 top-2 bg-brand-cream px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink">
                    Conceptual illustration
                  </span>
                )}
              </div>
              {img.caption && (
                <figcaption className="mt-2 font-mono text-[11px] leading-snug text-ink-muted">{img.caption}</figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
