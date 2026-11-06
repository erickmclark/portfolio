"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ProjectImage } from "@/lib/types";
import ImageViewer from "@/components/image-viewer";

function ZoomIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <path d="M10 10l4.5 4.5M6.5 4.5v4M4.5 6.5h4" />
    </svg>
  );
}

export default function ImageLightbox({ images, title }: { images: ProjectImage[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const total = images.length;

  return (
    <>
      <ul className="space-y-8">
        {images.map((img, i) => (
          <li key={`${img.url}-${i}`}>
            <figure>
              <div className="relative w-full overflow-hidden border border-ink bg-white">
                <button
                  type="button"
                  ref={(el) => {
                    triggers.current[i] = el;
                  }}
                  onClick={() => setIndex(i)}
                  aria-label={`Open image ${i + 1} of ${total} full screen: ${img.alt}`}
                  className="group relative block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-blue"
                >
                  <Image
                    src={img.url}
                    alt=""
                    width={1600}
                    height={1000}
                    sizes="(min-width:1440px) 1360px, 100vw"
                    priority={i === 0}
                    className="h-auto w-full"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 bg-ink/80 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-brand-cream transition-colors group-hover:bg-ink"
                  >
                    <ZoomIcon />
                    <span className="pointer-coarse:hidden">Click to zoom</span>
                    <span className="hidden pointer-coarse:inline">Tap to zoom</span>
                  </span>
                </button>
              </div>
              {img.caption && (
                <figcaption className="mt-2 font-mono text-[11px] leading-snug text-ink-muted">{img.caption}</figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

      <ImageViewer
        images={images}
        title={title}
        index={index}
        onIndexChange={setIndex}
        onClose={() => {
          const i = index;
          setIndex(null);
          if (i !== null) triggers.current[i]?.focus();
        }}
      />
    </>
  );
}
