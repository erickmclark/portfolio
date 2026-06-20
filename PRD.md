# Portfolio Site — Product Requirements

## Purpose
A personal portfolio for Erick Clark: a fast, polished, single-page site that presents who he
is, the projects he's built, and how to get in touch — with a private admin dashboard so the
content can be edited without touching code or triggering a rebuild.

## Audience
Recruiters, hiring managers, and potential clients evaluating Erick's work, plus Erick himself
as the sole content editor.

## Core requirements
- **Public site** (`/`): hero, projects, about, and contact sections, all driven by editable
  content. Per-project detail pages at `/projects/[slug]`.
- **Admin dashboard** (`/admin`): password-protected editor for projects, about, and contact
  content, with image upload and drag-to-reorder for projects.
- **Instant content updates**: edits persist to a runtime KV store (Upstash Redis) — no rebuild,
  no build minutes consumed. Code changes (and image uploads) are the only thing that triggers a deploy.
- **Quality bar**: accessible (visible focus, reduced-motion support), responsive, SEO-ready
  (metadata, OG image, structured data), and fast.

## Non-goals
Multi-user auth, a CMS for non-portfolio content, e-commerce, or a comment system.

## Architecture
See `CLAUDE.md` for the content-storage model, admin/auth flow, key files, and deployment.
