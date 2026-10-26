"use client";

import { useLayoutEffect } from "react";
import { shouldKeepPinning, shouldResetScroll } from "@/lib/scroll-reset";

let lastPathname: string | null = null;
let pushedPath: string | null = null;

if (typeof window !== "undefined") {
  // A link navigation commits through history.pushState to the new page's path; a back/forward traversal never
  // does. Recording the path (not just that a push happened) keeps a push that mounted no page (the view
  // toggle) from making a later traversal look like a link navigation. Independent of popstate order.
  const push = window.history.pushState;
  window.history.pushState = function (...args: Parameters<History["pushState"]>) {
    if (args[2] != null) pushedPath = new URL(String(args[2]), window.location.href).pathname;
    return push.apply(this, args);
  };
}

/**
 * Returns a newly navigated-to page to the top once its real content mounts. The route's loading
 * skeleton triggers Next's own scroll-to-top, which loses to scrolling still in motion (iOS momentum).
 */
export default function ScrollReset() {
  useLayoutEffect(() => {
    const { pathname, hash } = window.location;
    const reset = shouldResetScroll({ pathname, lastPathname, hash, pushedPath });
    lastPathname = pathname;
    pushedPath = null;
    if (!reset) return;

    const top = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    top();

    // An in-flight smooth scroll can keep moving after the first reset; re-pin briefly.
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    let intent = false;
    let raf = 0;
    const start = performance.now();
    const onIntent = () => { intent = true; };
    events.forEach((e) => window.addEventListener(e, onIntent, { passive: true }));
    const tick = () => {
      if (!shouldKeepPinning(performance.now() - start, intent)) return;
      if (window.scrollY !== 0) top();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      events.forEach((e) => window.removeEventListener(e, onIntent));
    };
  }, []);
  return null;
}
