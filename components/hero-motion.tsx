"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { EASE_OUT, PIECE_MS, docBox, flipDelta, staggerDelay, type Box } from "@/lib/motion";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function boxOf(el: Element): Box {
  const r = el.getBoundingClientRect();
  return docBox({ left: r.left, top: r.top, width: r.width, height: r.height }, window.scrollX, window.scrollY);
}

/**
 * Wraps the server-rendered hero configuration. On first mount the pieces
 * settle in with a CSS stagger from first paint (no hydration flicker); when the `view` prop changes (the view switcher is
 * a server navigation) each piece is FLIPped from its last recorded rect and
 * settles with a small overshoot. Rects are recorded after every commit and on
 * resize, so the "previous" rects are always the ones that were on screen
 * before the new server output committed.
 */
export function ConfigurationMotion({ view, children }: { view: string; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const rects = useRef<Box[]>([]);
  const last = useRef<string | null>(null);

  const pieces = () => Array.from(root.current?.querySelectorAll("[data-piece]") ?? []);
  useLayoutEffect(() => {
    const prev = last.current;
    last.current = view;
    const els = pieces();
    if (reduced() || !els.length) {
      rects.current = els.map(boxOf);
      return;
    }
    const next = els.map(boxOf);
    if (prev === null) {
      // First load: the CSS settle (data-settle) already runs from first paint.
      rects.current = next;
      return;
    }
    root.current?.removeAttribute("data-settle");
    const anims = els.map((el, i) => {
      const delta = rects.current[i] && flipDelta(rects.current[i], next[i]);
      const from: Keyframe = delta
        ? { transform: `translate(${delta.x}px, ${delta.y}px) scale(${delta.sx}, ${delta.sy})`, opacity: 0.55 }
        : { transform: "scale(0.97)", opacity: 0.55 };
      const rest: Keyframe = { transform: "none", opacity: 1 };
      return el.animate(
        [from, { transform: "scale(1.025)", opacity: 1, offset: 0.8 }, rest],
        { duration: PIECE_MS, delay: staggerDelay(i), easing: EASE_OUT, fill: "backwards" },
      );
    });
    rects.current = next;
    return () => anims.forEach((a) => a.cancel());
  }, [view]);

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const els = Array.from(root.current?.querySelectorAll("[data-piece]") ?? []);
        if (els.some((el) => el.getAnimations().length)) return;
        rects.current = els.map(boxOf);
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={root} data-settle="">
      {children}
    </div>;
}

/** Hero copy block: cross-fades in when the view changes, never on first load (the H1 is not animated on load). */
export function ViewFade({ view, className, children }: { view: string; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef(view);

  useLayoutEffect(() => {
    if (last.current === view) return;
    last.current = view;
    if (reduced() || !ref.current) return;
    const a = ref.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: EASE_OUT });
    return () => a.cancel();
  }, [view]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
