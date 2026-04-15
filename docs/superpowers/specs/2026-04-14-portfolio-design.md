# Developer Portfolio — Design Spec

**Date:** 2026-04-14  
**Stack:** Next.js 14+ (App Router) + Tailwind CSS  
**Deployment:** Vercel (static generation)

---

## Context

A personal software developer portfolio website. The goal is a polished, bold, and modern site that showcases projects, communicates who the developer is, and makes it easy for potential employers or collaborators to get in touch. Built to grow with the developer's career — adding new projects requires only adding a data object.

---

## Architecture

### Project Structure

```
/
├── app/
│   ├── layout.tsx               # Root layout: nav, fonts, global metadata
│   ├── page.tsx                 # Main single-page: Hero + Projects + About + Contact
│   └── projects/
│       └── [slug]/
│           └── page.tsx         # Individual project detail page
├── components/
│   ├── nav.tsx                  # Fixed top nav, backdrop-blur, smooth-scroll links
│   ├── hero.tsx                 # Full-viewport hero section
│   ├── projects.tsx             # Projects grid section
│   ├── project-card.tsx         # Card component: image, title, tech tags, links
│   ├── about.tsx                # About/bio section
│   └── contact.tsx              # Contact links section
├── data/
│   └── projects.ts              # Typed project array — single source of truth
└── public/
    └── projects/                # Project screenshot images
```

### Routing

- `/` — Main single-page experience. All four sections rendered sequentially. Nav links use `href="#section-id"` for smooth scroll.
- `/projects/[slug]` — Individual project detail pages. Statically generated at build time via `generateStaticParams`.

---

## Data Model

**`data/projects.ts`** — Plain TypeScript array, no CMS required.

```ts
type Project = {
  slug: string        // URL segment: /projects/my-project
  title: string
  tagline: string     // One-liner shown on project card
  description: string // Markdown string for detail page
  tech: string[]      // e.g. ["Next.js", "TypeScript", "Postgres"]
  githubUrl?: string
  liveUrl?: string
  image: string       // e.g. "/projects/my-project.png"
  featured: boolean   // Determines prominence on main projects section
}
```

To add a new project: add an object to the array and drop an image in `public/projects/`. No other changes needed.

---

## Components

### Nav
- Fixed to top, full-width
- Backdrop-blur + semi-transparent background (becomes opaque on scroll)
- Links: Work, About, Contact — all smooth-scroll anchors
- Name/logo on the left

### Hero (`#hero`)
- Full-viewport height (`min-h-screen`)
- Large display headline: developer's name + title
- Short tagline sentence
- Two CTAs: "View My Work" (scrolls to `#projects`) and "Contact Me" (scrolls to `#contact`)
- Left-aligned layout (editorial feel, fits bold & modern aesthetic)

### Projects (`#projects`)
- 2–3 column responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- Each `ProjectCard`: project image, title, tech stack tags, tagline, GitHub/live icon links
- Clicking the card navigates to `/projects/[slug]`
- Featured projects shown first

### Project Detail Page (`/projects/[slug]`)
- Full-width hero image
- Title, tech stack tags, GitHub/live links
- Description rendered from markdown (`react-markdown`)
- Back link to main page

### About (`#about`)
- Two-column layout: bio text left, photo/avatar right (stacks on mobile)
- Short bio paragraph(s)
- Skills listed as styled tags/chips

### Contact (`#contact`)
- Minimal: email address (mailto link), GitHub icon link, LinkedIn icon link
- No contact form (keeps it simple and low-maintenance)

---

## Visual Language

**Style:** Bold & modern  
**Philosophy:** Strong contrast, sharp typography, generous whitespace. One vivid accent color; neutral base everywhere else.

| Token | Value |
|---|---|
| Font (headings) | Inter or Geist, display weight |
| Font (body) | Same family, regular weight |
| Background | Near-black (#0a0a0a) — dark theme as the default |
| Accent color | One vivid color (e.g. electric blue `#3b82f6` or lime `#84cc16`) |
| Max width | ~1200px |
| Section padding | `py-24` |

Hover states on cards and links use the accent color. Transitions are `duration-200 ease-out`.

---

## SEO

- `generateMetadata` in `app/layout.tsx`: site name, description, Open Graph defaults
- `generateMetadata` in `app/projects/[slug]/page.tsx`: per-project title, description, OG image
- All project detail pages are statically generated at build time (`generateStaticParams`)
- No dynamic server routes — the entire site is a static export compatible with Vercel CDN

---

## Verification

1. `npm run build` completes with zero errors and zero type errors
2. `npm run dev` — manually verify each section scrolls correctly from nav links
3. Click each project card — confirm navigation to `/projects/[slug]`
4. On project detail page: confirm markdown renders, links work, back navigation works
5. Resize browser to mobile (375px) — verify all sections stack and remain readable
6. Deploy to Vercel preview — confirm static generation, check page titles and OG metadata
