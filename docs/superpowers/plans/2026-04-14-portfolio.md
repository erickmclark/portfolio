# Developer Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bold, modern software developer portfolio with Next.js 14+ (App Router) and Tailwind CSS — a single-page scroll experience with individual project detail routes.

**Architecture:** The main page (`/`) renders Hero → Projects → About → Contact sequentially. Each section has an `id` for smooth-scroll nav. Project data lives in `data/projects.ts` as a typed array. Individual project pages at `/projects/[slug]` are statically generated at build time.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, lucide-react (icons), react-markdown (project detail descriptions)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `tailwind.config.ts` | Modify | Add custom `accent` color + dark base palette |
| `app/globals.css` | Modify | Dark background base, smooth scroll |
| `app/layout.tsx` | Create | Root layout: Nav, Geist/Inter font, global metadata |
| `app/page.tsx` | Create | Composes all four sections in order |
| `app/projects/[slug]/page.tsx` | Create | Project detail page, static generation, per-page metadata |
| `components/nav.tsx` | Create | Fixed top nav, scroll-aware, smooth-scroll anchor links |
| `components/hero.tsx` | Create | Full-viewport hero: name, title, tagline, two CTAs |
| `components/projects.tsx` | Create | Responsive project grid, featured first |
| `components/project-card.tsx` | Create | Card: image, title, tech tags, tagline, icon links |
| `components/markdown-renderer.tsx` | Create | Client component wrapper for react-markdown |
| `components/about.tsx` | Create | Two-column bio + skills chips |
| `components/contact.tsx` | Create | Email, GitHub, LinkedIn icon links |
| `data/projects.ts` | Create | Project type definition + sample project data |
| `public/projects/` | Create | Directory for project screenshot images |

---

## Task 1: Scaffold Next.js Project

**Files:**
- Modifies: project root (creates all Next.js scaffolding)

- [ ] **Step 1: Initialize Next.js with TypeScript, Tailwind, App Router**

Run in the project root (`/Users/erick/Cursor + Claude Code Projects/Test Project`):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

If prompted about existing files, answer yes to overwrite/continue.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install react-markdown lucide-react
npm install -D @types/react-markdown
```

> Note: `@types/react-markdown` may not exist for recent versions — if npm warns it's not found, skip it. `react-markdown` ships its own types.

- [ ] **Step 3: Verify the dev server starts**

```bash
npm run dev
```

Expected: `▲ Next.js 14.x.x` in terminal, `http://localhost:3000` loads the default Next.js page.

Stop the server with `Ctrl+C`.

- [ ] **Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 14 project with TypeScript and Tailwind"
```

---

## Task 2: Configure Tailwind Theme + Global Styles

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Update tailwind.config.ts with custom palette**

Replace the contents of `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#141414",
        border: "#262626",
        muted: "#737373",
        accent: "#3b82f6",        // electric blue — change to taste
        "accent-hover": "#2563eb",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        site: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Update app/globals.css**

Replace the contents of `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
  background-color: #0a0a0a;
  color: #fafafa;
}

body {
  background-color: #0a0a0a;
  color: #fafafa;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Offset scroll targets to account for fixed nav height */
section[id] {
  scroll-margin-top: 72px;
}
```

- [ ] **Step 3: Verify TypeScript types are clean**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "style: configure Tailwind dark theme and global styles"
```

---

## Task 3: Create Data Layer

**Files:**
- Create: `data/projects.ts`
- Create: `public/projects/.gitkeep`

- [ ] **Step 1: Create the projects directory for images**

```bash
mkdir -p public/projects
touch public/projects/.gitkeep
```

- [ ] **Step 2: Create data/projects.ts**

```bash
mkdir -p data
```

Create `data/projects.ts`:

```ts
export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string; // Markdown
  tech: string[];
  githubUrl?: string;
  liveUrl?: string;
  image: string; // Path relative to /public, e.g. "/projects/my-project.png"
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    tagline: "A short description of what this project does.",
    description: `
## Overview

Project One is a web application that solves a specific problem. Built with modern tooling and shipped to production.

## Key Features

- Feature A: brief explanation
- Feature B: brief explanation
- Feature C: brief explanation

## Challenges

Describe the interesting technical challenges you solved here.
    `.trim(),
    tech: ["Next.js", "TypeScript", "Postgres", "Tailwind CSS"],
    githubUrl: "https://github.com/yourusername/project-one",
    liveUrl: "https://project-one.vercel.app",
    image: "/projects/project-one.png",
    featured: true,
  },
  {
    slug: "project-two",
    title: "Project Two",
    tagline: "Another project with a memorable one-liner.",
    description: `
## Overview

Project Two is a CLI tool / API / library that does something useful.

## Key Features

- Feature A
- Feature B

## What I Learned

Reflection on what this project taught you.
    `.trim(),
    tech: ["Python", "FastAPI", "Docker"],
    githubUrl: "https://github.com/yourusername/project-two",
    image: "/projects/project-two.png",
    featured: true,
  },
  {
    slug: "project-three",
    title: "Project Three",
    tagline: "A utility or side project worth showing off.",
    description: `
## Overview

Project Three is a smaller project or experiment.
    `.trim(),
    tech: ["Go", "Redis"],
    githubUrl: "https://github.com/yourusername/project-three",
    image: "/projects/project-three.png",
    featured: false,
  },
];
```

- [ ] **Step 3: Verify types**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add data/projects.ts public/projects/.gitkeep
git commit -m "feat: add Project type and sample project data"
```

---

## Task 4: Build Nav Component

**Files:**
- Create: `components/nav.tsx`

The nav is a client component because it tracks scroll position to toggle opacity.

- [ ] **Step 1: Create components/nav.tsx**

```bash
mkdir -p components
```

Create `components/nav.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Nav() {
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
          Your Name
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
```

- [ ] **Step 2: Verify types**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/nav.tsx
git commit -m "feat: add Nav component with scroll-aware styling"
```

---

## Task 5: Build Hero Section

**Files:**
- Create: `components/hero.tsx`

- [ ] **Step 1: Create components/hero.tsx**

```tsx
export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center px-6 pt-[72px]"
    >
      <div className="max-w-site mx-auto w-full">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          Available for work
        </p>
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6">
          Your Name.
          <br />
          <span className="text-muted">Software Engineer.</span>
        </h1>
        <p className="text-xl text-muted max-w-xl mb-10 leading-relaxed">
          I build fast, reliable web products — from APIs to polished UIs.
          Currently open to full-time roles and freelance projects.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="#projects"
            className="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors duration-200"
          >
            View My Work
          </a>
          <a
            href="#contact"
            className="inline-flex items-center px-6 py-3 border border-border hover:border-accent text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Contact Me
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify types**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/hero.tsx
git commit -m "feat: add Hero section component"
```

---

## Task 6: Build ProjectCard Component

**Files:**
- Create: `components/project-card.tsx`

- [ ] **Step 1: Create components/project-card.tsx**

```tsx
import Link from "next/link";
import Image from "next/image";
import { Github, ExternalLink } from "lucide-react";
import type { Project } from "@/data/projects";

type Props = {
  project: Project;
};

export default function ProjectCard({ project }: Props) {
  return (
    <div className="group relative bg-surface border border-border rounded-xl overflow-hidden hover:border-accent transition-colors duration-200">
      {/* Image */}
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative w-full aspect-video bg-border overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              // Hide broken images gracefully
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-6">
        {/* Tech tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-xs font-medium px-2 py-1 rounded-md bg-background text-muted border border-border"
            >
              {t}
            </span>
          ))}
        </div>

        <Link href={`/projects/${project.slug}`}>
          <h3 className="text-lg font-bold mb-1 hover:text-accent transition-colors duration-200">
            {project.title}
          </h3>
        </Link>
        <p className="text-sm text-muted mb-4 leading-relaxed">
          {project.tagline}
        </p>

        {/* Links */}
        <div className="flex items-center gap-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors duration-200"
            >
              <Github size={14} />
              GitHub
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors duration-200"
            >
              <ExternalLink size={14} />
              Live
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify types**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/project-card.tsx
git commit -m "feat: add ProjectCard component"
```

---

## Task 7: Build Projects Section

**Files:**
- Create: `components/projects.tsx`

- [ ] **Step 1: Create components/projects.tsx**

```tsx
import { projects } from "@/data/projects";
import ProjectCard from "./project-card";

export default function Projects() {
  // Featured projects first, then the rest
  const sorted = [
    ...projects.filter((p) => p.featured),
    ...projects.filter((p) => !p.featured),
  ];

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-site mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          Selected Work
        </p>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-12">
          Things I've Built
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify types**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/projects.tsx
git commit -m "feat: add Projects grid section"
```

---

## Task 8: Build About Section

**Files:**
- Create: `components/about.tsx`

- [ ] **Step 1: Create components/about.tsx**

```tsx
const skills = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Go",
  "Python",
  "PostgreSQL",
  "Redis",
  "Docker",
  "AWS",
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6 bg-surface">
      <div className="max-w-site mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          About
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Bio */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-6">
              Who I Am
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                I'm a software engineer with X years of experience building
                full-stack web applications. I specialize in TypeScript, React,
                and Node.js — and I care deeply about performance, clean
                architecture, and developer experience.
              </p>
              <p>
                Previously at [Company A] and [Company B], where I worked on
                [brief description of impact]. I'm currently [status — looking
                for new opportunities / freelancing / open to collaborations].
              </p>
              <p>
                Outside of code: [one personal detail — hiking, music, coffee,
                etc.].
              </p>
            </div>

            {/* Skills */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold tracking-widest uppercase text-muted mb-4">
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm px-3 py-1.5 rounded-full border border-border text-white hover:border-accent transition-colors duration-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Avatar placeholder */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-64 h-64 rounded-2xl bg-border border border-border overflow-hidden flex items-center justify-center text-muted text-sm">
              {/* Replace this div with an <Image> component once you have a photo */}
              Your Photo
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify types**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/about.tsx
git commit -m "feat: add About section with bio and skills"
```

---

## Task 9: Build Contact Section

**Files:**
- Create: `components/contact.tsx`

- [ ] **Step 1: Create components/contact.tsx**

```tsx
import { Mail, Github, Linkedin } from "lucide-react";

const EMAIL = "you@example.com";
const GITHUB_URL = "https://github.com/yourusername";
const LINKEDIN_URL = "https://linkedin.com/in/yourhandle";

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-site mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          Contact
        </p>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-6">
          Let's Work Together
        </h2>
        <p className="text-muted text-lg max-w-lg mb-12 leading-relaxed">
          Whether you have a project in mind, a role to fill, or just want to
          connect — my inbox is open.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <a
            href={`mailto:${EMAIL}`}
            className="flex items-center gap-3 text-lg font-semibold hover:text-accent transition-colors duration-200"
          >
            <Mail size={20} className="text-accent" />
            {EMAIL}
          </a>
          <div className="flex items-center gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 text-muted hover:text-white transition-colors duration-200"
            >
              <Github size={22} />
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 text-muted hover:text-white transition-colors duration-200"
            >
              <Linkedin size={22} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update the constants** at the top of `components/contact.tsx` with your real email, GitHub URL, and LinkedIn URL before committing.

- [ ] **Step 3: Verify types**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/contact.tsx
git commit -m "feat: add Contact section with email and social links"
```

---

## Task 10: Build Markdown Renderer

**Files:**
- Create: `components/markdown-renderer.tsx`

`react-markdown` must be used inside a client component in Next.js App Router.

- [ ] **Step 1: Create components/markdown-renderer.tsx**

```tsx
"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  content: string;
};

export default function MarkdownRenderer({ content }: Props) {
  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-muted leading-relaxed mb-4">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 text-muted mb-4">
            {children}
          </ul>
        ),
        li: ({ children }) => <li>{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="bg-surface px-1.5 py-0.5 rounded text-sm font-mono text-accent">
            {children}
          </code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

- [ ] **Step 2: Verify types**

```bash
npx tsc --noEmit
```

Expected: No errors. If `react-markdown` has a type conflict with the `components` prop, add `// @ts-expect-error` above the conflicting line as a last resort.

- [ ] **Step 3: Commit**

```bash
git add components/markdown-renderer.tsx
git commit -m "feat: add MarkdownRenderer client component"
```

---

## Task 11: Build Root Layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Your Name — Software Engineer",
    template: "%s | Your Name",
  },
  description:
    "Software engineer specializing in TypeScript, React, and Node.js. Building fast, reliable web products.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yoursite.com",
    siteName: "Your Name",
    title: "Your Name — Software Engineer",
    description:
      "Software engineer specializing in TypeScript, React, and Node.js.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Name — Software Engineer",
    description:
      "Software engineer specializing in TypeScript, React, and Node.js.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-white antialiased">
        <Nav />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update the metadata** — replace `"Your Name"`, `"https://yoursite.com"`, and the description with real values.

- [ ] **Step 3: Verify types**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add root layout with Nav, Inter font, and global metadata"
```

---

## Task 12: Build Main Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx**

```tsx
import Hero from "@/components/hero";
import Projects from "@/components/projects";
import About from "@/components/about";
import Contact from "@/components/contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <Projects />
      <About />
      <Contact />
    </main>
  );
}
```

- [ ] **Step 2: Verify types**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Smoke test in the browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Nav appears at the top
- All four sections render in order (Hero, Projects, About, Contact)
- Clicking nav links scrolls smoothly to the correct section
- On mobile (DevTools → 375px), sections stack cleanly

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: compose main page from section components"
```

---

## Task 13: Build Project Detail Page

**Files:**
- Create: `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p "app/projects/[slug]"
```

- [ ] **Step 2: Create app/projects/[slug]/page.tsx**

```tsx
import { notFound } from "next/navigation";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { projects } from "@/data/projects";
import MarkdownRenderer from "@/components/markdown-renderer";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    openGraph: {
      title: project.title,
      description: project.tagline,
      images: [{ url: project.image }],
    },
  };
}

export default function ProjectPage({ params }: Props) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <main className="pt-[72px]">
      {/* Hero image */}
      <div className="relative w-full aspect-video max-h-[500px] bg-surface overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Content */}
      <div className="max-w-site mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors duration-200 mb-8"
        >
          <ArrowLeft size={14} />
          Back to projects
        </Link>

        {/* Title + meta */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">
          {project.title}
        </h1>
        <p className="text-lg text-muted mb-6">{project.tagline}</p>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-xs font-medium px-3 py-1 rounded-full border border-border text-muted"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 mb-12">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:border-accent rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <Github size={16} />
              View on GitHub
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg text-sm font-medium text-white transition-colors duration-200"
            >
              <ExternalLink size={16} />
              Live Demo
            </a>
          )}
        </div>

        {/* Markdown description */}
        <div className="max-w-2xl">
          <MarkdownRenderer content={project.description} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify types**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Test project detail pages in the browser**

With `npm run dev` running:
- Open `http://localhost:3000/projects/project-one`
- Verify: hero image area renders (may be blank without a real image), title and tagline show, tech tags appear, markdown description renders with correct headings/lists, "Back to projects" navigates to `/#projects`
- Open `http://localhost:3000/projects/project-two` and verify same

- [ ] **Step 5: Commit**

```bash
git add "app/projects/[slug]/page.tsx"
git commit -m "feat: add project detail page with static generation and markdown"
```

---

## Task 14: Final Build Verification

**Files:** None — verification only.

- [ ] **Step 1: Run the production build**

```bash
npm run build
```

Expected output: build completes with `✓ Generating static pages` and no TypeScript errors. Note the route list — all `/projects/[slug]` routes should appear as static pages.

If the build fails with image errors (Next.js complains about external images), add the relevant domains to `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Add external image domains here if needed
    ],
  },
};
module.exports = nextConfig;
```

- [ ] **Step 2: Run locally in production mode**

```bash
npm run start
```

Open `http://localhost:3000` and verify:
- All sections scroll correctly from nav links
- Project cards navigate to detail pages
- Back link from detail page works
- All tech tags and links render
- Mobile layout (375px DevTools) stacks cleanly

- [ ] **Step 3: Personalize before launch**

Search for all placeholder content and replace with real values:

| Placeholder | File | Replace with |
|---|---|---|
| `Your Name` | `components/nav.tsx`, `app/layout.tsx` | Your real name |
| `you@example.com` | `components/contact.tsx` | Your real email |
| `https://github.com/yourusername` | `components/contact.tsx`, `data/projects.ts` | Your GitHub URL |
| `https://linkedin.com/in/yourhandle` | `components/contact.tsx` | Your LinkedIn URL |
| `https://yoursite.com` | `app/layout.tsx` | Your deployed URL |
| Bio text | `components/about.tsx` | Your real bio |
| `skills` array | `components/about.tsx` | Your actual tech stack |
| Projects | `data/projects.ts` | Your real projects |
| Project images | `public/projects/` | Real screenshots |

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete portfolio — Hero, Projects, About, Contact, project detail pages"
```

- [ ] **Step 5: Deploy to Vercel**

```bash
npx vercel
```

Follow the prompts to link to your Vercel account and deploy. The site will be live at a `*.vercel.app` URL. Add a custom domain in the Vercel dashboard if desired.
