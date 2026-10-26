"use client";

import { useLayoutEffect, useRef } from "react";
import { assemblyPiece, scrollProgress, stepLit } from "@/lib/motion";

/**
 * Scroll-linked assembly for the Approach section (the one scrubbed device).
 * Desktop (>= 1024px) with motion allowed only: the configuration's pieces fly
 * into place as it scrolls into view and the three steps light in order.
 * Nothing is pinned or hijacked; native scrolling is untouched. Otherwise the
 * server markup is left as is (everything visible).
 */
export default function ApproachAssembly({ view, children }: { view: string; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Pieces are re-queried on every pass: a view change replaces the slot nodes.
    const find = () => ({
      pieces: Array.from(el.querySelectorAll<HTMLElement>("[data-piece]")),
      steps: Array.from(el.querySelectorAll<HTMLElement>("[data-step]")),
    });
    let raf = 0;
    let active = false;

    const update = () => {
      raf = 0;
      const { pieces, steps } = find();
      const figure = pieces[0]?.parentElement;
      if (!figure) return;
      // Complete (t = 1) once the figure reaches where it sits when the section top is at the anchor-landing
      // position (header 64px + scroll-margin 72px), so landing on #approach shows the finished state. It finishes 0.1 x viewport height earlier
      // so the finished state is reached while scrolling in, not only on landing.
      const vh = window.innerHeight;
      const top = figure.getBoundingClientRect().top;
      const sectionTop = (el.closest("section") ?? el).getBoundingClientRect().top;
      const end = 72 + (top - sectionTop) + 8 + vh * 0.1;
      const start = Math.max(vh, end + vh * 0.2);
      const t = scrollProgress(top, vh, start / vh, end / vh);
      pieces.forEach((p, i) => {
        const s = assemblyPiece(t, i, pieces.length);
        p.style.transform = `translate(${s.x}px, ${s.y}px)`;
        p.style.opacity = String(s.opacity);
      });
      steps.forEach((s, i) => {
        s.dataset.lit = stepLit(t, i, steps.length) ? "true" : "false";
      });
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const stop = () => {
      active = false;
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      cancelAnimationFrame(raf);
      raf = 0;
      el.removeAttribute("data-assemble");
      const { pieces, steps } = find();
      pieces.forEach((p) => {
        p.style.transform = "";
        p.style.opacity = "";
      });
      steps.forEach((s) => s.removeAttribute("data-lit"));
    };
    const sync = () => {
      const want = desktop.matches && !reduce.matches;
      if (want && !active) {
        active = true;
        el.dataset.assemble = "on";
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", request);
        update();
      } else if (!want && active) stop();
    };

    sync();
    desktop.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      desktop.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      stop();
    };
  }, [view]);

  return <div ref={root}>{children}</div>;
}
