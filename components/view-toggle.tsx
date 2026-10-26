"use client";

import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { shouldSetPending } from "@/lib/bottom-nav-current";
import type { View } from "@/lib/home-view";

type Item = { view: View; label: string; href: string };

const motion = "duration-(--dur-base) ease-(--ease-out-expo) motion-reduce:transition-none";

/**
 * Audience view switcher. An ink indicator slides under the selected segment, as in the mobile bottom nav;
 * segments are content-sized, so the indicator is measured. It moves on click, before the server navigation
 * commits. Until the first measurement the selected link paints its own ink background, so server HTML is correct.
 */
export default function ViewToggle({ items, view }: { items: Item[]; view: View }) {
  const nav = useRef<HTMLElement>(null);
  // Optimistic selection for the in-flight navigation; cleared as soon as the view changes.
  const [pending, setPending] = useState<{ view: View; from: View } | null>(null);
  if (pending && pending.from !== view) setPending(null);
  const shown = pending?.view ?? view;

  useLayoutEffect(() => {
    const el = nav.current;
    const target = el?.querySelector<HTMLElement>(`[data-view="${shown}"]`);
    if (!el || !target) return;
    const place = () => {
      // Subpixel rects; offsetLeft/offsetWidth round and leave a 1px seam.
      const box = target.getBoundingClientRect();
      el.style.setProperty("--x", `${box.left - el.getBoundingClientRect().left - el.clientLeft}px`);
      el.style.setProperty("--w", `${box.width}px`);
      el.dataset.ready = "";
    };
    place();
    // Re-measure when widths change (web font swap, resize).
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [shown]);

  const tap = (v: View) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (v !== shown && shouldSetPending(e)) setPending({ view: v, from: view });
  };

  return (
    <nav ref={nav} aria-label="Audience view" className="group relative mt-2.5 inline-flex border-2 border-ink bg-paper">
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 hidden w-(--w) translate-x-(--x) bg-ink transition-[translate,width] group-data-ready:block ${motion}`}
      />
      {items.map(({ view: v, label, href }, i) => (
        <Link
          key={v}
          href={href}
          scroll={false}
          data-view={v}
          aria-current={v === view ? "true" : undefined}
          onClick={tap(v)}
          className={`on-dark relative inline-flex min-h-11 items-center px-4 text-sm font-semibold transition-colors ${motion} ${
            i > 0 ? "border-l-2 border-ink" : ""
          } ${v === shown ? "bg-ink text-white group-data-ready:bg-transparent" : "text-ink hover:bg-white"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
