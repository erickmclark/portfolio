"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ProjectImage } from "@/lib/types";

const ZOOM_WIDTH = "220%";
const btn =
  "inline-flex h-11 w-11 items-center justify-center border border-brand-cream/40 bg-ink/80 text-brand-cream hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cream";

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
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const focal = useRef({ x: 0.5, y: 0.5 });
  const total = images.length;
  const open = index !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    if (!dialog.open) dialog.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!zoomed || !el) return;
    el.scrollLeft = focal.current.x * el.scrollWidth - el.clientWidth / 2;
    el.scrollTop = focal.current.y * el.scrollHeight - el.clientHeight / 2;
  }, [zoomed]);

  const close = () => dialogRef.current?.close();
  const onClosed = () => {
    const i = index;
    setIndex(null);
    setZoomed(false);
    if (i !== null) triggers.current[i]?.focus();
  };
  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i === null ? i : (i + delta + total) % total));
      setZoomed(false);
    },
    [total],
  );

  const toggleZoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!zoomed) {
      const r = (e.currentTarget.querySelector("img") ?? e.currentTarget).getBoundingClientRect();
      focal.current =
        e.detail === 0
          ? { x: 0.5, y: 0.5 }
          : { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    }
    setZoomed((z) => !z);
  };

  const follow = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!zoomed || e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.scrollLeft = ((e.clientX - r.left) / r.width) * (el.scrollWidth - el.clientWidth);
    el.scrollTop = ((e.clientY - r.top) / r.height) * (el.scrollHeight - el.clientHeight);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (total < 2 || zoomed) return;
    if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
  };

  const current = index !== null ? images[index] : null;

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
                {img.kind === "conceptual" && (
                  <span className="pointer-events-none absolute left-2 top-2 bg-brand-cream px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink">
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

      <dialog
        ref={dialogRef}
        aria-label={index !== null ? `${title} image ${index + 1} of ${total}` : title}
        onClose={onClosed}
        onKeyDown={onKeyDown}
        className="m-0 h-dvh max-h-none w-screen max-w-none flex-col bg-ink p-0 text-brand-cream backdrop:bg-transparent open:flex"
      >
        {current && index !== null && (
          <>
            <div className="flex items-center justify-between px-4 py-2 font-mono text-[12px]">
              <span aria-live="polite">{total > 1 ? `${index + 1} / ${total}` : ""}</span>
              <button type="button" onClick={close} aria-label="Close image viewer" className={btn}>
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            </div>
            <div className="relative min-h-0 flex-1">
              <div
                ref={scrollRef}
                onPointerMove={follow}
                {...(zoomed ? { tabIndex: 0, role: "region", "aria-label": "Magnified image, use arrow keys to pan" } : {})}
                onClick={(e) => {
                  if (e.target === e.currentTarget) close();
                }}
                className="flex h-full w-full overflow-auto px-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-cream"
              >
                <button
                  type="button"
                  onClick={toggleZoom}
                  aria-pressed={zoomed}
                  aria-label={`Magnify image: ${current.alt}`}
                  style={zoomed ? { width: ZOOM_WIDTH } : undefined}
                  className={`pointer-events-none m-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-cream ${zoomed ? "block shrink-0 max-w-none cursor-zoom-out" : "flex h-full max-w-full cursor-zoom-in items-center justify-center"}`}
                >
                  <Image
                    key={current.url}
                    src={current.url}
                    alt=""
                    width={2880}
                    height={1800}
                    unoptimized
                    className={zoomed ? "pointer-events-auto h-auto w-full" : "pointer-events-auto h-auto max-h-full w-auto max-w-full object-contain"}
                  />
                </button>
              </div>
              {total > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label="Previous image" className={`${btn} absolute left-2 top-1/2 -translate-y-1/2`}>
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 3L5 8l5 5" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Next image" className={`${btn} absolute right-2 top-1/2 -translate-y-1/2`}>
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 3l5 5-5 5" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-col items-center gap-1 px-4 py-3 text-center font-mono text-[11px] leading-snug">
              {current.kind === "conceptual" && (
                <span className="bg-brand-cream px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink">
                  Conceptual illustration
                </span>
              )}
              {current.caption && <p>{current.caption}</p>}
              <p className="opacity-70">
                <span className="pointer-coarse:hidden">{zoomed ? "Click image to fit screen" : "Click image to magnify"}</span>
                <span className="hidden pointer-coarse:inline">{zoomed ? "Tap image to fit screen" : "Tap image to magnify"}</span>
              </p>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
