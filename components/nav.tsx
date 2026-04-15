"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type Props = { name: string };

export default function Nav({ name }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  if (pathname.startsWith('/admin')) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-xl shadow-background/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-site mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight hover:text-accent transition-colors duration-200"
        >
          {name}
        </Link>
        <nav className="flex items-center gap-1">
          <a
            href="#projects"
            className="px-4 py-2 text-sm text-muted hover:text-white hover:bg-surface rounded-lg transition-all duration-200"
          >
            Work
          </a>
          <a
            href="#about"
            className="px-4 py-2 text-sm text-muted hover:text-white hover:bg-surface rounded-lg transition-all duration-200"
          >
            About
          </a>
          <a
            href="#contact"
            className="ml-2 px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors duration-200"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
