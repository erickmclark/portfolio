"use client";

import { useEffect } from "react";

/** Lands on the ?category= group once the real content exists; smooth only when motion is allowed. */
export default function CategoryScroll({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [targetId]);
  return null;
}
