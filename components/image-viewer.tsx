"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ProjectImage } from "@/lib/types";

const ZOOM_WIDTH = "220%";
const btn =
  "inline-flex h-11 w-11 items-center justify-center border border-brand-cream/40 bg-ink/80 text-brand-cream hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cream";

export default function ImageViewer({
  images,
  title,
  index,
  onIndexChange,
  onClose,
}: {
  images: ProjectImage[];
  title: string;
  index: number | null;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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
    setZoomed(false);
    onClose();
  };
  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + total) % total);
      setZoomed(false);
    },
    [index, total, onIndexChange],
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
            {current.caption && <p>{current.caption}</p>}
            <p className="opacity-70">
              <span className="pointer-coarse:hidden">{zoomed ? "Click image to fit screen" : "Click image to magnify"}</span>
              <span className="hidden pointer-coarse:inline">{zoomed ? "Tap image to fit screen" : "Tap image to magnify"}</span>
            </p>
          </div>
        </>
      )}
  </dialog>
  );
}
