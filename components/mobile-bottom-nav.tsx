"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { nextBottomNavVisible } from "@/lib/bottom-nav-visibility";

type Props = { resumeUrl?: string };

const item =
  "inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full focus-visible:rounded-full! px-2 text-[15px] font-semibold";

export default function MobileBottomNav({ resumeUrl }: Props) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pastHero = useRef(true);
  const lastY = useRef(0);
  const visibleRef = useRef(false);
  const leftHero = useRef(false);
  const frame = useRef(0);
  const admin = pathname.startsWith("/admin");

  useEffect(() => {
    if (admin) return;
    const update = (next: boolean) => {
      visibleRef.current = next;
      setVisible(next);
    };

    const hero = document.getElementById("top");
    pastHero.current = !hero;
    lastY.current = window.scrollY;
    let observer: IntersectionObserver | undefined;
    if (hero) {
      observer = new IntersectionObserver(([entry]) => {
        pastHero.current = !entry.isIntersecting;
        if (!pastHero.current) update(false);
        else {
          leftHero.current = frame.current !== 0;
          lastY.current = window.scrollY;
          update(true);
        }
      });
      observer.observe(hero);
    } else {
      update(true);
    }

    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const y = Math.max(0, window.scrollY);
        const next = nextBottomNavVisible({
          visible: visibleRef.current,
          pastHero: pastHero.current,
          y,
          lastY: lastY.current,
          leftHero: leftHero.current,
        });
        leftHero.current = false;
        if (Math.abs(y - lastY.current) >= 8) lastY.current = y;
        if (next !== visibleRef.current) update(next);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const details = document.querySelector<HTMLDetailsElement>("header details");
    const onToggle = () => setMenuOpen(!!details?.open);
    details?.addEventListener("toggle", onToggle);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      details?.removeEventListener("toggle", onToggle);
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [admin, pathname]);

  if (admin) return null;

  const openMenu = () => {
    const details = document.querySelector<HTMLDetailsElement>("header details");
    if (!details) return;
    details.open = !details.open;
    window.scrollTo({ top: 0 });
  };

  return (
    <nav
      aria-label="Quick navigation"
      inert={!visible}
      style={{ bottom: "calc(12px + env(safe-area-inset-bottom))" }}
      className={`bottom-nav font-body [&_a]:focus-visible:outline-brand-sky! [&_button]:focus-visible:outline-brand-sky! fixed inset-x-3 z-40 mx-auto flex max-w-sm items-center justify-between rounded-full bg-ink px-1 py-1 text-white shadow-lg transition-[opacity,transform] duration-300 md:hidden motion-reduce:translate-y-0 motion-reduce:transition-opacity ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[140%] opacity-0"
      }`}
    >
      <Link href="/#work" className={item}>
        Work
      </Link>
      <Link href="/#approach" className={item}>
        Approach
      </Link>
      <Link href="/#contact" className={`${item} bg-brand-orange px-2.5 text-ink`}>
        Contact
      </Link>
      {resumeUrl && (
        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className={item}>
          Résumé
        </a>
      )}
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={menuOpen}
        onClick={openMenu}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full focus-visible:rounded-full!"
      >
        <Menu size={20} aria-hidden />
      </button>
    </nav>
  );
}
