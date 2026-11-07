"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ProjectImage } from "@/lib/types";
import ImageViewer from "@/components/image-viewer";

export default function WorkCardMedia({
  images,
  title,
  src,
  alt,
  sizes,
  priority,
}: {
  images: ProjectImage[];
  title: string;
  src: string;
  alt: string;
  sizes: string;
  priority: boolean;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden border border-ink bg-white">
      <button
        type="button"
        ref={trigger}
        onClick={() => setIndex(0)}
        aria-label={`Open ${title} images full screen`}
        className="group absolute inset-0 block h-full w-full cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-blue"
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 bg-ink/80 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-brand-cream transition-colors group-hover:bg-ink"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="4.5" />
            <path d="M10 10l4.5 4.5M6.5 4.5v4M4.5 6.5h4" />
          </svg>
          <span className="pointer-coarse:hidden">Click to zoom</span>
          <span className="hidden pointer-coarse:inline">Tap to zoom</span>
        </span>
      </button>
      <ImageViewer
        images={images}
        title={title}
        index={index}
        onIndexChange={setIndex}
        onClose={() => {
          setIndex(null);
          trigger.current?.focus();
        }}
      />
    </div>
  );
}
