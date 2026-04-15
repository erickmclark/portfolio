"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = { name: string };

export default function Nav({ name }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-site mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight hover:text-accent transition-colors duration-200"
        >
          {name}
        </Link>
        <nav className="flex items-center gap-8">
          <a
            href="#projects"
            className="text-sm text-muted hover:text-white transition-colors duration-200"
          >
            Work
          </a>
          <a
            href="#about"
            className="text-sm text-muted hover:text-white transition-colors duration-200"
          >
            About
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-accent hover:text-accent-hover transition-colors duration-200"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
