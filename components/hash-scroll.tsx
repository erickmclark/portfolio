"use client";

import { useEffect } from "react";
import { hashTargetId } from "@/lib/hash-link";

/** Scrolls to location.hash once the real content exists (the route's loading skeleton has no target). */
export default function HashScroll() {
  useEffect(() => {
    const id = hashTargetId(window.location.hash);
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
  }, []);
  return null;
}
