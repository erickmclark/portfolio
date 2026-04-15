# Portfolio Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a password-protected `/admin` panel that lets the portfolio owner update all site content (projects, about, contact) through a web UI — changes commit to GitHub and trigger a Netlify redeploy automatically.

**Architecture:** All editable content lives in `content/data.json` in the repo. Site components read this file at build time. The admin panel reads/writes it via the GitHub Contents API. Auth uses a signed JWT cookie (jose). The Projects tab has drag-to-reorder, image upload, and GitHub URL auto-fill.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, jose (JWT), @dnd-kit/core + @dnd-kit/sortable (drag-and-drop), GitHub Contents API

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/types.ts` | Create | SiteContent, Project, AboutContent, ContactContent types |
| `lib/content.ts` | Create | Reads content/data.json at build time |
| `lib/github.ts` | Create | GitHub API client: read/write files, fetch repo info |
| `lib/auth.ts` | Create | JWT sign/verify, session cookie helpers |
| `content/data.json` | Create | Migrated content from hardcoded component values |
| `app/api/admin/auth/route.ts` | Create | POST: check password, set session cookie |
| `app/api/admin/content/route.ts` | Create | GET: read data.json from GitHub; PUT: commit updated JSON |
| `app/api/admin/image/route.ts` | Create | POST: upload image to repo via GitHub API |
| `app/api/github/repo/route.ts` | Create | GET: fetch repo name/description/languages by URL |
| `app/admin/page.tsx` | Create | Password gate (client component) |
| `app/admin/dashboard/page.tsx` | Create | Server component: auth check → render DashboardClient |
| `app/admin/dashboard/dashboard-client.tsx` | Create | Client: tab shell, content state, Save & Deploy |
| `app/admin/dashboard/projects-tab.tsx` | Create | Client: DnD project list, forms, image upload, GitHub fetch |
| `app/admin/dashboard/about-tab.tsx` | Create | Client: name, availability, bio, skills editor |
| `app/admin/dashboard/contact-tab.tsx` | Create | Client: email, GitHub URL, LinkedIn URL fields |
| `.env.local.example` | Create | Documents required env vars |
| `components/hero.tsx` | Modify | Read name/availableForWork from getSiteContent() |
| `components/nav.tsx` | Modify | Read name from getSiteContent() |
| `components/about.tsx` | Modify | Read about from getSiteContent() |
| `components/contact.tsx` | Modify | Read contact from getSiteContent() |
| `components/projects.tsx` | Modify | Read projects from getSiteContent() |
| `app/projects/[slug]/page.tsx` | Modify | Read projects from getSiteContent() |

---

## Task 1: Install Dependencies + Create Types

**Files:**
- Modify: `package.json` (via npm install)
- Create: `lib/types.ts`

- [ ] **Step 1: Install dependencies**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && npm install jose @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected: packages added to `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Create lib/types.ts**

```bash
mkdir -p "/Users/erick/Cursor + Claude Code Projects/Test Project/lib"
```

Create `lib/types.ts`:

```ts
export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string; // Markdown
  tech: string[];
  githubUrl?: string;
  liveUrl?: string;
  image: string;
  featured: boolean;
  order: number;
};

export type AboutContent = {
  name: string;
  availableForWork: boolean;
  bio: string[]; // Array of paragraph strings
  skills: string[];
};

export type ContactContent = {
  email: string;
  githubUrl: string;
  linkedinUrl: string;
};

export type SiteContent = {
  projects: Project[];
  about: AboutContent;
  contact: ContactContent;
};
```

- [ ] **Step 3: Verify types**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && git add lib/types.ts package.json package-lock.json && git commit -m "feat: add SiteContent types and install admin deps"
```

---

## Task 2: Create content/data.json

**Files:**
- Create: `content/data.json`

- [ ] **Step 1: Create content directory and data.json**

```bash
mkdir -p "/Users/erick/Cursor + Claude Code Projects/Test Project/content"
```

Create `content/data.json` with the migrated content from the existing hardcoded component values:

```json
{
  "projects": [
    {
      "slug": "project-one",
      "title": "Project One",
      "tagline": "A short description of what this project does.",
      "description": "## Overview\n\nProject One is a web application that solves a specific problem. Built with modern tooling and shipped to production.\n\n## Key Features\n\n- Feature A: brief explanation\n- Feature B: brief explanation\n- Feature C: brief explanation\n\n## Challenges\n\nDescribe the interesting technical challenges you solved here.",
      "tech": ["Next.js", "TypeScript", "Postgres", "Tailwind CSS"],
      "githubUrl": "https://github.com/yourusername/project-one",
      "liveUrl": "https://project-one.vercel.app",
      "image": "/projects/project-one.png",
      "featured": true,
      "order": 0
    },
    {
      "slug": "project-two",
      "title": "Project Two",
      "tagline": "Another project with a memorable one-liner.",
      "description": "## Overview\n\nProject Two is a CLI tool / API / library that does something useful.\n\n## Key Features\n\n- Feature A\n- Feature B\n\n## What I Learned\n\nReflection on what this project taught you.",
      "tech": ["Python", "FastAPI", "Docker"],
      "githubUrl": "https://github.com/yourusername/project-two",
      "image": "/projects/project-two.png",
      "featured": true,
      "order": 1
    },
    {
      "slug": "project-three",
      "title": "Project Three",
      "tagline": "A utility or side project worth showing off.",
      "description": "## Overview\n\nProject Three is a smaller project or experiment.",
      "tech": ["Go", "Redis"],
      "githubUrl": "https://github.com/yourusername/project-three",
      "image": "/projects/project-three.png",
      "featured": false,
      "order": 2
    }
  ],
  "about": {
    "name": "Your Name",
    "availableForWork": true,
    "bio": [
      "I'm a software engineer with X years of experience building full-stack web applications. I specialize in TypeScript, React, and Node.js — and I care deeply about performance, clean architecture, and developer experience.",
      "Previously at [Company A] and [Company B], where I worked on [brief description of impact]. I'm currently looking for new opportunities.",
      "Outside of code: [one personal detail — hiking, music, coffee, etc.]."
    ],
    "skills": ["TypeScript", "React", "Next.js", "Node.js", "Go", "Python", "PostgreSQL", "Redis", "Docker", "AWS"]
  },
  "contact": {
    "email": "you@example.com",
    "githubUrl": "https://github.com/yourusername",
    "linkedinUrl": "https://linkedin.com/in/yourhandle"
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && git add content/data.json && git commit -m "feat: add content/data.json as single source of truth"
```

---

## Task 3: Create lib/content.ts, lib/github.ts, lib/auth.ts

**Files:**
- Create: `lib/content.ts`
- Create: `lib/github.ts`
- Create: `lib/auth.ts`

- [ ] **Step 1: Create lib/content.ts**

```ts
import { readFileSync } from 'fs';
import { join } from 'path';
import type { SiteContent } from './types';

export function getSiteContent(): SiteContent {
  const raw = readFileSync(join(process.cwd(), 'content', 'data.json'), 'utf-8');
  return JSON.parse(raw) as SiteContent;
}
```

- [ ] **Step 2: Create lib/github.ts**

```ts
import type { SiteContent } from './types';

const BASE = 'https://api.github.com';

function ghHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

export async function getRepoFile(path: string): Promise<{ content: SiteContent; sha: string }> {
  const res = await fetch(
    `${BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`,
    { headers: ghHeaders(), cache: 'no-store' }
  );
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json() as { content: string; sha: string };
  const decoded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')) as SiteContent;
  return { content: decoded, sha: data.sha };
}

export async function putRepoFile(
  path: string,
  content: SiteContent,
  sha: string,
  message: string
): Promise<void> {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const res = await fetch(
    `${BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: ghHeaders(),
      body: JSON.stringify({ message, content: encoded, sha }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT failed: ${res.status} — ${err}`);
  }
}

export async function putRepoImage(slug: string, imageBase64: string, sha?: string): Promise<string> {
  const path = `public/projects/${slug}.png`;
  const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const body: Record<string, string> = {
    message: `feat: update image for project ${slug}`,
    content: base64,
  };
  if (sha) body.sha = sha;
  const res = await fetch(
    `${BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`,
    { method: 'PUT', headers: ghHeaders(), body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub image upload failed: ${res.status} — ${err}`);
  }
  return `/projects/${slug}.png`;
}

export async function getRepoInfo(owner: string, repo: string): Promise<{
  title: string;
  tagline: string;
  tech: string[];
}> {
  const [repoRes, langsRes] = await Promise.all([
    fetch(`${BASE}/repos/${owner}/${repo}`, { headers: ghHeaders() }),
    fetch(`${BASE}/repos/${owner}/${repo}/languages`, { headers: ghHeaders() }),
  ]);
  if (!repoRes.ok) throw new Error(`Repo not found: ${owner}/${repo}`);
  const repoData = await repoRes.json() as { name: string; description: string | null };
  const langsData = langsRes.ok ? (await langsRes.json() as Record<string, number>) : {};
  return {
    title: repoData.name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    tagline: repoData.description ?? '',
    tech: Object.keys(langsData).slice(0, 5),
  };
}
```

- [ ] **Step 3: Create lib/auth.ts**

```ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'admin_session';

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET env var not set');
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
```

- [ ] **Step 4: Verify types**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && git add lib/content.ts lib/github.ts lib/auth.ts && git commit -m "feat: add content, github, and auth utility libraries"
```

---

## Task 4: Update Site Components to Read from content/data.json

**Files:**
- Modify: `components/hero.tsx`
- Modify: `components/nav.tsx`
- Modify: `components/about.tsx`
- Modify: `components/contact.tsx`
- Modify: `components/projects.tsx`
- Modify: `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Update components/hero.tsx**

Replace the entire file:

```tsx
import { getSiteContent } from '@/lib/content';

export default function Hero() {
  const { about } = getSiteContent();

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center px-6 pt-[72px]"
    >
      <div className="max-w-site mx-auto w-full">
        {about.availableForWork && (
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
            Available for work
          </p>
        )}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6">
          {about.name}.
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

- [ ] **Step 2: Update components/nav.tsx**

Nav is a `"use client"` component (uses `useEffect`/`useState`), so it cannot call `getSiteContent()` directly — `fs.readFileSync` is a Node.js API that would crash in the browser during hydration. Instead, accept `name` as a prop. The server layout (`app/layout.tsx`) will read and pass it.

Replace `components/nav.tsx` with:

```tsx
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
```

Then update `app/layout.tsx` to pass the name prop. Replace the layout file:

```tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import { getSiteContent } from "@/lib/content";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
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
  const { about } = getSiteContent();
  return (
    <html lang="en" className={geist.variable}>
      <body className="bg-background text-foreground antialiased">
        <Nav name={about.name} />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update components/about.tsx**

Replace the entire file:

```tsx
import { getSiteContent } from '@/lib/content';

export default function About() {
  const { about } = getSiteContent();

  return (
    <section id="about" className="py-24 px-6 bg-surface">
      <div className="max-w-site mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          About
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-6">
              Who I Am
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              {about.bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <div className="mt-8">
              <h3 className="text-sm font-semibold tracking-widest uppercase text-muted mb-4">
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.map((skill) => (
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
          <div className="flex justify-center lg:justify-end">
            <div className="w-64 h-64 rounded-2xl bg-border border border-border flex items-center justify-center text-muted text-sm">
              Your Photo
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Update components/contact.tsx**

Replace the entire file:

```tsx
import { Mail, GitBranch, Globe } from 'lucide-react';
import { getSiteContent } from '@/lib/content';

export default function Contact() {
  const { contact } = getSiteContent();

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-site mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          Contact
        </p>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-6">
          Let&apos;s Work Together
        </h2>
        <p className="text-muted text-lg max-w-lg mb-12 leading-relaxed">
          Whether you have a project in mind, a role to fill, or just want to
          connect — my inbox is open.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-3 text-lg font-semibold hover:text-accent transition-colors duration-200"
          >
            <Mail size={20} className="text-accent" />
            {contact.email}
          </a>
          <div className="flex items-center gap-4">
            <a
              href={contact.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 text-muted hover:text-white transition-colors duration-200"
            >
              <GitBranch size={22} />
            </a>
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 text-muted hover:text-white transition-colors duration-200"
            >
              <Globe size={22} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Update components/projects.tsx**

Replace the entire file:

```tsx
import { getSiteContent } from '@/lib/content';
import ProjectCard from './project-card';

export default function Projects() {
  const { projects } = getSiteContent();
  const sorted = [...projects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.order - b.order;
  });

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-site mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          Selected Work
        </p>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-12">
          Things I&apos;ve Built
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

- [ ] **Step 6: Update components/project-card.tsx**

The `Project` type import must now come from `@/lib/types` instead of `@/data/projects`. Replace the import line only:

Change:
```tsx
import type { Project } from "@/data/projects";
```
To:
```tsx
import type { Project } from "@/lib/types";
```

- [ ] **Step 7: Update app/projects/[slug]/page.tsx**

Replace the `projects` import. Change:
```tsx
import { projects } from "@/data/projects";
```
To:
```tsx
import { getSiteContent } from "@/lib/content";
```

Then replace all uses of `projects` with `getSiteContent().projects`. The two places are:
1. `generateStaticParams`: `return projects.map(...)` → `return getSiteContent().projects.map(...)`
2. `generateMetadata`: `const project = projects.find(...)` → `const projects = getSiteContent().projects; const project = projects.find(...)`
3. `ProjectPage`: `const project = projects.find(...)` → `const projects = getSiteContent().projects; const project = projects.find(...)`

Full updated file:

```tsx
import { notFound } from "next/navigation";
import { ArrowLeft, GitBranch, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import MarkdownRenderer from "@/components/markdown-renderer";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getSiteContent().projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getSiteContent().projects.find((p) => p.slug === slug);
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

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getSiteContent().projects.find((p) => p.slug === slug);
  if (!project) return notFound();

  return (
    <main className="pt-[72px]">
      <div className="relative w-full aspect-video max-h-[500px] bg-surface overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      <div className="max-w-site mx-auto px-6 py-16">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors duration-200 mb-8"
        >
          <ArrowLeft size={14} />
          Back to projects
        </Link>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">
          {project.title}
        </h1>
        <p className="text-lg text-muted mb-6">{project.tagline}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tech.map((t) => (
            <span key={t} className="text-xs font-medium px-3 py-1 rounded-full border border-border text-muted">
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 mb-12">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:border-accent rounded-lg text-sm font-medium transition-colors duration-200">
              <GitBranch size={16} />
              View on GitHub
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg text-sm font-medium text-white transition-colors duration-200">
              <ExternalLink size={16} />
              Live Demo
            </a>
          )}
        </div>
        <div className="max-w-2xl">
          <MarkdownRenderer content={project.description} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 8: Verify types and build**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 9: Commit**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && git add components/hero.tsx components/nav.tsx components/about.tsx components/contact.tsx components/projects.tsx components/project-card.tsx "app/projects/[slug]/page.tsx" && git commit -m "feat: wire site components to read from content/data.json"
```

---

## Task 5: API Routes — Auth + Content

**Files:**
- Create: `app/api/admin/auth/route.ts`
- Create: `app/api/admin/content/route.ts`

- [ ] **Step 1: Create app/api/admin/auth/route.ts**

```bash
mkdir -p "/Users/erick/Cursor + Claude Code Projects/Test Project/app/api/admin/auth"
```

Create `app/api/admin/auth/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { signAdminToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { password } = await request.json() as { password: string };

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD not configured' }, { status: 500 });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await signAdminToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return response;
}
```

- [ ] **Step 2: Create app/api/admin/content/route.ts**

```bash
mkdir -p "/Users/erick/Cursor + Claude Code Projects/Test Project/app/api/admin/content"
```

Create `app/api/admin/content/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getRepoFile, putRepoFile } from '@/lib/github';
import type { SiteContent } from '@/lib/types';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { content, sha } = await getRepoFile('content/data.json');
    return NextResponse.json({ content, sha });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { content, sha } = await request.json() as { content: SiteContent; sha: string };
    await putRepoFile('content/data.json', content, sha, 'content: update via admin panel');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verify types**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && git add app/api/admin/auth/route.ts app/api/admin/content/route.ts && git commit -m "feat: add admin auth and content API routes"
```

---

## Task 6: API Routes — Image Upload + GitHub Repo Fetch

**Files:**
- Create: `app/api/admin/image/route.ts`
- Create: `app/api/github/repo/route.ts`

- [ ] **Step 1: Create app/api/admin/image/route.ts**

```bash
mkdir -p "/Users/erick/Cursor + Claude Code Projects/Test Project/app/api/admin/image"
```

Create `app/api/admin/image/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { putRepoImage } from '@/lib/github';

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { slug, imageBase64, sha } = await request.json() as {
      slug: string;
      imageBase64: string;
      sha?: string;
    };
    const imagePath = await putRepoImage(slug, imageBase64, sha);
    return NextResponse.json({ imagePath });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create app/api/github/repo/route.ts**

```bash
mkdir -p "/Users/erick/Cursor + Claude Code Projects/Test Project/app/api/github/repo"
```

Create `app/api/github/repo/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getRepoInfo } from '@/lib/github';

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }
  const match = url.match(/github\.com\/([^/]+)\/([^/\s]+)/);
  if (!match) {
    return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
  }
  const [, owner, repo] = match;
  try {
    const info = await getRepoInfo(owner, repo.replace(/\.git$/, ''));
    return NextResponse.json(info);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verify types**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && git add app/api/admin/image/route.ts app/api/github/repo/route.ts && git commit -m "feat: add image upload and GitHub repo fetch API routes"
```

---

## Task 7: Admin Password Gate Page

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create app/admin/page.tsx**

```bash
mkdir -p "/Users/erick/Cursor + Claude Code Projects/Test Project/app/admin"
```

Create `app/admin/page.tsx`:

```tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setError('Incorrect password. Try again.');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-black tracking-tighter mb-2">Admin</h1>
        <p className="text-muted text-sm mb-8">Enter your password to manage content.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            autoFocus
            disabled={loading}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full px-4 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            {loading ? 'Signing in…' : 'Enter'}
          </button>
        </form>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify types**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && git add app/admin/page.tsx && git commit -m "feat: add admin password gate page"
```

---

## Task 8: Dashboard Shell + About Tab + Contact Tab

**Files:**
- Create: `app/admin/dashboard/page.tsx`
- Create: `app/admin/dashboard/dashboard-client.tsx`
- Create: `app/admin/dashboard/about-tab.tsx`
- Create: `app/admin/dashboard/contact-tab.tsx`

- [ ] **Step 1: Create app/admin/dashboard/page.tsx**

```bash
mkdir -p "/Users/erick/Cursor + Claude Code Projects/Test Project/app/admin/dashboard"
```

Create `app/admin/dashboard/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  if (!(await isAuthenticated())) redirect('/admin');
  return <DashboardClient />;
}
```

- [ ] **Step 2: Create app/admin/dashboard/about-tab.tsx**

```tsx
"use client";

import { useState } from 'react';
import type { AboutContent } from '@/lib/types';

export default function AboutTab({
  about,
  onChange,
}: {
  about: AboutContent;
  onChange: (about: AboutContent) => void;
}) {
  const [skillInput, setSkillInput] = useState('');

  function update<K extends keyof AboutContent>(key: K, value: AboutContent[K]) {
    onChange({ ...about, [key]: value });
  }

  function addSkill(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!about.skills.includes(skillInput.trim())) {
        update('skills', [...about.skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold">About</h2>

      <div>
        <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Your Name</label>
        <input
          value={about.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => update('availableForWork', !about.availableForWork)}
          className={`relative w-10 h-6 rounded-full transition-colors ${about.availableForWork ? 'bg-accent' : 'bg-border'}`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${about.availableForWork ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
        <span className="text-sm">Available for work <span className="text-muted">(shows badge in hero)</span></span>
      </div>

      <div className="space-y-3">
        <label className="text-xs text-muted uppercase tracking-widest block">Bio Paragraphs</label>
        {about.bio.map((para, i) => (
          <textarea
            key={i}
            value={para}
            onChange={(e) => {
              const newBio = [...about.bio];
              newBio[i] = e.target.value;
              update('bio', newBio);
            }}
            rows={3}
            placeholder={`Paragraph ${i + 1}`}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-accent resize-y transition-colors"
          />
        ))}
      </div>

      <div>
        <label className="text-xs text-muted uppercase tracking-widest mb-2 block">Skills</label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
          {about.skills.map((skill) => (
            <span key={skill} className="flex items-center gap-1 text-sm px-3 py-1 border border-border rounded-full">
              {skill}
              <button
                type="button"
                onClick={() => update('skills', about.skills.filter((s) => s !== skill))}
                className="text-muted hover:text-white ml-1 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={addSkill}
          placeholder="Type a skill and press Enter to add"
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create app/admin/dashboard/contact-tab.tsx**

```tsx
"use client";

import type { ContactContent } from '@/lib/types';

export default function ContactTab({
  contact,
  onChange,
}: {
  contact: ContactContent;
  onChange: (contact: ContactContent) => void;
}) {
  function update<K extends keyof ContactContent>(key: K, value: string) {
    onChange({ ...contact, [key]: value });
  }

  const fields: { key: keyof ContactContent; label: string; placeholder: string; type: string }[] = [
    { key: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email' },
    { key: 'githubUrl', label: 'GitHub URL', placeholder: 'https://github.com/yourusername', type: 'url' },
    { key: 'linkedinUrl', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/yourhandle', type: 'url' },
  ];

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-bold">Contact</h2>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="text-xs text-muted uppercase tracking-widest mb-1 block">{f.label}</label>
          <input
            type={f.type}
            value={contact[f.key]}
            onChange={(e) => update(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create app/admin/dashboard/dashboard-client.tsx**

```tsx
"use client";

import { useEffect, useState } from 'react';
import type { SiteContent } from '@/lib/types';
import AboutTab from './about-tab';
import ContactTab from './contact-tab';

// ProjectsTab is imported in Task 9 — placeholder for now
import ProjectsTab from './projects-tab';

type Tab = 'projects' | 'about' | 'contact';

export default function DashboardClient() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [sha, setSha] = useState('');
  const [tab, setTab] = useState<Tab>('projects');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then(({ content, sha }: { content: SiteContent; sha: string }) => {
        setContent(content);
        setSha(sha);
      })
      .catch(() => setSaveError('Failed to load content.'));
  }, []);

  function update(updated: SiteContent) {
    setContent(updated);
    setDirty(true);
    setSaved(false);
    setSaveError('');
  }

  async function save() {
    if (!content) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, sha }),
      });
      if (!res.ok) throw new Error(await res.text());
      setDirty(false);
      setSaved(true);
    } catch (e) {
      setSaveError(`Save failed: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {saveError ? (
          <p className="text-red-400">{saveError}</p>
        ) : (
          <p className="text-muted animate-pulse">Loading content…</p>
        )}
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Sticky header */}
      <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-md z-40">
        <div className="max-w-4xl mx-auto px-6 h-[60px] flex items-center gap-6">
          <span className="font-bold text-sm shrink-0">Admin</span>
          <div className="flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                  tab === t.id ? 'bg-surface text-white' : 'text-muted hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <a href="/" className="ml-auto text-xs text-muted hover:text-white transition-colors">
            ← View site
          </a>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {tab === 'projects' && (
          <ProjectsTab
            projects={content.projects}
            onChange={(projects) => update({ ...content, projects })}
          />
        )}
        {tab === 'about' && (
          <AboutTab
            about={content.about}
            onChange={(about) => update({ ...content, about })}
          />
        )}
        {tab === 'contact' && (
          <ContactTab
            contact={content.contact}
            onChange={(contact) => update({ ...content, contact })}
          />
        )}
      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-md p-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-sm">
            {saved && !dirty && <span className="text-green-400">✓ Saved — Netlify is rebuilding (~60s)</span>}
            {dirty && !saveError && <span className="text-muted">Unsaved changes</span>}
            {saveError && <span className="text-red-400 text-xs">{saveError}</span>}
          </div>
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="shrink-0 flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-lg transition-colors duration-200 text-sm"
          >
            {saving ? 'Saving…' : `Save & Deploy${dirty ? ' ●' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify types**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && npx tsc --noEmit
```

If you get an error about `projects-tab` not existing yet, create a temporary stub file:

```bash
cat > "/Users/erick/Cursor + Claude Code Projects/Test Project/app/admin/dashboard/projects-tab.tsx" << 'EOF'
"use client";
import type { Project } from '@/lib/types';
export default function ProjectsTab({ projects, onChange }: { projects: Project[]; onChange: (p: Project[]) => void }) {
  return <div>Projects tab — coming in Task 9</div>;
}
EOF
```

Then re-run tsc.

- [ ] **Step 6: Commit**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && git add app/admin/dashboard/ && git commit -m "feat: add admin dashboard shell with about and contact tabs"
```

---

## Task 9: Projects Tab with Drag-and-Drop, Image Upload, GitHub Fetch

**Files:**
- Create (replace stub): `app/admin/dashboard/projects-tab.tsx`

- [ ] **Step 1: Create app/admin/dashboard/projects-tab.tsx**

Replace the stub with the full implementation:

```tsx
"use client";

import { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronUp, Trash2, Plus, GitBranch } from 'lucide-react';
import type { Project } from '@/lib/types';

// ── Tech tag chip editor ───────────────────────────────────────────────────
function TechTagsEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
      setInput('');
    }
  }

  return (
    <div>
      <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Tech Stack</label>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 bg-background border border-border rounded-md">
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-muted hover:text-white ml-1 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type a technology and press Enter"
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  );
}

// ── Single sortable project row ────────────────────────────────────────────
function SortableProject({
  project,
  onUpdate,
  onDelete,
}: {
  project: Project;
  onUpdate: (updated: Project) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: project.slug,
  });
  const [expanded, setExpanded] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const style = { transform: CSS.Transform.toString(transform), transition };

  function set<K extends keyof Project>(key: K, value: Project[K]) {
    onUpdate({ ...project, [key]: value });
  }

  async function fetchFromGitHub() {
    if (!project.githubUrl) return;
    setFetching(true);
    try {
      const res = await fetch(
        `/api/github/repo?url=${encodeURIComponent(project.githubUrl)}`
      );
      if (res.ok) {
        const { title, tagline, tech } = (await res.json()) as {
          title: string;
          tagline: string;
          tech: string[];
        };
        onUpdate({ ...project, title, tagline, tech });
      }
    } finally {
      setFetching(false);
    }
  }

  async function handleImageFile(file: File) {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const res = await fetch('/api/admin/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: project.slug, imageBase64: base64 }),
        });
        if (res.ok) {
          const { imagePath } = (await res.json()) as { imagePath: string };
          set('image', imagePath);
        }
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Row header */}
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-muted hover:text-white cursor-grab active:cursor-grabbing shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
        <p className="flex-1 font-medium truncate min-w-0">
          {project.title || <span className="text-muted italic">Untitled Project</span>}
        </p>
        {project.featured && (
          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
            Featured
          </span>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-muted hover:text-white"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded edit form */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* GitHub URL + Auto-fill */}
          <div>
            <label className="text-xs text-muted uppercase tracking-widest mb-1 block">GitHub URL</label>
            <div className="flex gap-2">
              <input
                value={project.githubUrl ?? ''}
                onChange={(e) => set('githubUrl', e.target.value || undefined)}
                placeholder="https://github.com/you/repo"
                className="flex-1 min-w-0 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={fetchFromGitHub}
                disabled={fetching || !project.githubUrl}
                className="shrink-0 px-3 py-2 border border-border hover:border-accent rounded-lg text-sm text-muted hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <GitBranch size={14} />
                {fetching ? 'Fetching…' : 'Auto-fill'}
              </button>
            </div>
            <p className="text-xs text-muted mt-1">Paste a GitHub URL then click Auto-fill to populate title, tagline, and tech stack.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Title</label>
              <input
                value={project.title}
                onChange={(e) => set('title', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Slug (URL path)</label>
              <input
                value={project.slug}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Tagline</label>
            <input
              value={project.tagline}
              onChange={(e) => set('tagline', e.target.value)}
              placeholder="One-liner shown on project card"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Description (Markdown)</label>
            <textarea
              value={project.description}
              onChange={(e) => set('description', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent font-mono resize-y transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Live URL (optional)</label>
            <input
              value={project.liveUrl ?? ''}
              onChange={(e) => set('liveUrl', e.target.value || undefined)}
              placeholder="https://myproject.vercel.app"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <TechTagsEditor tags={project.tech} onChange={(tech) => set('tech', tech)} />

          {/* Featured toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('featured', !project.featured)}
              className={`relative w-10 h-6 rounded-full transition-colors ${project.featured ? 'bg-accent' : 'bg-border'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${project.featured ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm">Featured <span className="text-muted">(shown first on the site)</span></span>
          </div>

          {/* Image upload */}
          <div>
            <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Project Image</label>
            <div
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleImageFile(file);
              }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-accent rounded-lg p-6 text-center cursor-pointer transition-colors"
            >
              {uploading ? (
                <p className="text-sm text-muted animate-pulse">Uploading…</p>
              ) : project.image ? (
                <p className="text-sm text-muted">
                  Current: <span className="text-white">{project.image}</span>
                  <br />
                  <span className="text-xs">Drop a new image here or click to replace</span>
                </p>
              ) : (
                <p className="text-sm text-muted">Drop an image here or click to upload</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
            />
          </div>

          {/* Delete */}
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete "${project.title || 'this project'}"?`)) onDelete();
            }}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={14} />
            Delete project
          </button>
        </div>
      )}
    </div>
  );
}

// ── Projects tab root ──────────────────────────────────────────────────────
export default function ProjectsTab({
  projects,
  onChange,
}: {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.slug === active.id);
      const newIndex = projects.findIndex((p) => p.slug === over.id);
      onChange(
        arrayMove(projects, oldIndex, newIndex).map((p, i) => ({ ...p, order: i }))
      );
    }
  }

  function addProject() {
    const slug = `project-${Date.now()}`;
    const newProject: Project = {
      slug,
      title: '',
      tagline: '',
      description: '',
      tech: [],
      image: `/projects/${slug}.png`,
      featured: false,
      order: projects.length,
    };
    onChange([...projects, newProject]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Projects</h2>
        <p className="text-sm text-muted">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={projects.map((p) => p.slug)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {projects.map((project) => (
              <SortableProject
                key={project.slug}
                project={project}
                onUpdate={(updated) =>
                  onChange(projects.map((p) => (p.slug === updated.slug ? updated : p)))
                }
                onDelete={() => onChange(projects.filter((p) => p.slug !== project.slug))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addProject}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border hover:border-accent text-muted hover:text-white rounded-xl transition-colors text-sm"
      >
        <Plus size={16} />
        Add Project
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify types**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && git add app/admin/dashboard/projects-tab.tsx && git commit -m "feat: add projects tab with drag-to-reorder, image upload, and GitHub auto-fill"
```

---

## Task 10: Env Vars, Build Verification, Push

**Files:**
- Create: `.env.local.example`

- [ ] **Step 1: Create .env.local.example**

```bash
cat > "/Users/erick/Cursor + Claude Code Projects/Test Project/.env.local.example" << 'EOF'
# Admin panel password — choose anything you like
ADMIN_PASSWORD=your-chosen-password

# Random 32+ character string for signing session cookies
# Generate one: openssl rand -base64 32
ADMIN_SECRET=replace-with-random-32-char-string

# GitHub token with repo scope (run: gh auth token)
GITHUB_TOKEN=ghp_...

# Your GitHub username and repo name
GITHUB_OWNER=erickmclark
GITHUB_REPO=portfolio
EOF
```

- [ ] **Step 2: Create .env.local from the example**

```bash
cp "/Users/erick/Cursor + Claude Code Projects/Test Project/.env.local.example" "/Users/erick/Cursor + Claude Code Projects/Test Project/.env.local"
```

Then open `.env.local` and fill in real values:
- Set `ADMIN_PASSWORD` to any password you want
- Set `ADMIN_SECRET` to the output of: `openssl rand -base64 32`
- Set `GITHUB_TOKEN` to the output of: `gh auth token`
- `GITHUB_OWNER=erickmclark` and `GITHUB_REPO=portfolio` are already correct

- [ ] **Step 3: Verify .env.local is gitignored**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && grep ".env.local" .gitignore
```

Expected: `.env.local` is listed. If not, add it:
```bash
echo ".env.local" >> "/Users/erick/Cursor + Claude Code Projects/Test Project/.gitignore"
```

- [ ] **Step 4: Run the production build**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && npm run build
```

Expected: `✓ Compiled successfully` with zero TypeScript errors. The admin routes (`/admin`, `/admin/dashboard`) will appear as dynamic routes in the build output.

If you see errors, fix them before continuing.

- [ ] **Step 5: Commit and push**

```bash
cd "/Users/erick/Cursor + Claude Code Projects/Test Project" && git add .env.local.example .gitignore && git commit -m "feat: add env var template and complete admin panel"
git push origin main
```

- [ ] **Step 6: Manual smoke test**

With `npm run dev` running and `.env.local` populated:

1. Visit `http://localhost:3000` — confirm the public site still works
2. Visit `http://localhost:3000/admin` — confirm password gate appears
3. Enter wrong password — confirm error message shown
4. Enter correct password — confirm redirect to `/admin/dashboard`
5. Reload `/admin/dashboard` — confirm it stays (cookie persists)
6. Switch to each tab (Projects, About, Contact) — confirm they render
7. Edit a project title — confirm the "Save & Deploy ●" button activates
8. Click "Save & Deploy" — confirm it calls the GitHub API and commits `content/data.json` (check your GitHub repo)
9. Drag a project to reorder — confirm order changes
10. Click "+ Add Project" — confirm a new blank entry appears
11. Paste a GitHub URL and click "Auto-fill" — confirm title/tagline/tech populate
