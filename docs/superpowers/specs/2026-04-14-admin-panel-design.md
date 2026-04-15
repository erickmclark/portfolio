# Portfolio Admin Panel — Design Spec

**Date:** 2026-04-14  
**Feature:** Content management admin panel at `/admin`  
**Approach:** GitHub API + JSON content file, auto-deploys via Netlify

---

## Context

The portfolio site currently has all content hardcoded in TypeScript files (`data/projects.ts`, `components/about.tsx`, `components/contact.tsx`). Updating the site requires editing source files directly. This spec describes an `/admin` panel that lets the owner update all content through a web UI — no code editing required. Changes are saved by committing `content/data.json` to GitHub, which triggers a Netlify redeploy automatically.

---

## Architecture

### New Files

```
content/
└── data.json                        ← single source of truth for all editable content

app/
├── admin/
│   ├── page.tsx                     ← password gate (redirects to dashboard if authed)
│   └── dashboard/
│       └── page.tsx                 ← admin dashboard UI (client component)
└── api/
    ├── admin/
    │   ├── auth/route.ts            ← POST: verify password, set session cookie
    │   ├── content/route.ts         ← GET: read data.json, PUT: commit to GitHub
    │   └── image/route.ts           ← POST: upload image to repo via GitHub API
    └── github/
        └── repo/route.ts            ← GET: fetch repo metadata by GitHub URL

lib/
├── github.ts                        ← GitHub API client (read/write files, fetch repo info)
├── auth.ts                          ← session cookie helpers (sign/verify using jose JWT)
└── content.ts                       ← reads content/data.json at build time, exports typed SiteContent
```

### Modified Files

```
data/projects.ts      → deleted, replaced by reading content/data.json
components/about.tsx  → reads name, bio, skills from content/data.json
components/contact.tsx → reads email, githubUrl, linkedinUrl from content/data.json
components/hero.tsx   → reads name, availableForWork from content/data.json
components/nav.tsx    → reads name from content/data.json
```

All site components that currently have hardcoded content will be updated to import from a shared `lib/content.ts` helper that reads `content/data.json` at build time.

### Data Flow

1. User visits `/admin` → sees password form
2. Submits password → `POST /api/admin/auth` → sets `httpOnly` session cookie
3. Redirected to `/admin/dashboard` → `GET /api/admin/content` loads current `data.json` from GitHub
4. User edits content in the UI
5. "Save & Deploy" → `PUT /api/admin/content` → server commits updated `data.json` to GitHub → Netlify auto-redeploys (~60s)

---

## Content Schema (`content/data.json`)

```json
{
  "projects": [
    {
      "slug": "project-one",
      "title": "Project One",
      "tagline": "Short one-liner shown on the project card",
      "description": "Markdown string for the detail page",
      "tech": ["Next.js", "TypeScript"],
      "githubUrl": "https://github.com/erickmclark/project-one",
      "liveUrl": "https://project-one.vercel.app",
      "image": "/projects/project-one.png",
      "featured": true,
      "order": 0
    }
  ],
  "about": {
    "name": "Your Name",
    "availableForWork": true,
    "bio": [
      "Paragraph one...",
      "Paragraph two...",
      "Paragraph three..."
    ],
    "skills": ["TypeScript", "React", "Next.js", "Node.js"]
  },
  "contact": {
    "email": "you@example.com",
    "githubUrl": "https://github.com/erickmclark",
    "linkedinUrl": "https://linkedin.com/in/yourhandle"
  }
}
```

---

## Admin UI

### Password Gate (`/admin`)

- Simple centered form: password input + "Enter" button
- Wrong password: shake animation + error message
- Correct password: redirected to `/admin/dashboard`
- Session stored in a signed `httpOnly` cookie (`admin_session`)
- No account system — single password from `ADMIN_PASSWORD` env var

### Dashboard (`/admin/dashboard`)

Three tabs: **Projects | About | Contact**

**Projects tab:**
- Drag-and-drop list of projects (using `@dnd-kit/core`) — drag the handle on the left to reorder
- Each project row shows: thumbnail, title, featured badge
- Click a project to expand an edit form with:
  - Title, tagline, description (markdown textarea)
  - Tech tags: type + Enter to add, click × to remove
  - GitHub URL field with "Fetch from GitHub" button — calls `/api/github/repo` to auto-fill title, tagline, and tech tags from the repo
  - Live URL field
  - Featured toggle
  - Image drop zone: drag an image file or click to upload — saved to `public/projects/[slug].png` in the repo
  - Delete button (with confirm)
- **"+ Add Project"** button at the bottom — creates a blank project form (unlimited projects supported)

**About tab:**
- Name field (used in nav, hero headline)
- "Available for work" toggle (shows/hides the accent badge in the hero)
- Bio: three paragraph textareas (Bio 1, Bio 2, Bio 3)
- Skills: chip editor — type a skill, press Enter to add, click × to remove (unlimited skills)

**Contact tab:**
- Email field
- GitHub URL field
- LinkedIn URL field

**Bottom bar (sticky, always visible):**
- "Save & Deploy" button
- On click: commits `data.json` to GitHub → shows "Deploying…" spinner → links to Netlify deploy log when available
- Unsaved changes indicator (dot on the button when edits are pending)

---

## API Routes

### `POST /api/admin/auth`
- Body: `{ password: string }`
- Compares against `ADMIN_PASSWORD` env var
- Success: sets signed `httpOnly` cookie `admin_session=<signed-token>`, returns `200`
- Failure: returns `401`

### `GET /api/admin/content`
- Requires valid session cookie
- Calls GitHub Contents API: `GET /repos/{owner}/{repo}/contents/content/data.json`
- Returns decoded JSON content + file SHA (needed for updates)

### `PUT /api/admin/content`
- Requires valid session cookie
- Body: `{ content: SiteContent, sha: string }`
- Base64-encodes updated JSON, calls GitHub Contents API: `PUT /repos/{owner}/{repo}/contents/content/data.json`
- Returns `200` on success

### `POST /api/admin/image`
- Requires valid session cookie
- Body: `{ slug: string, imageBase64: string, sha?: string }`
- Commits image to `public/projects/{slug}.png` via GitHub Contents API
- Returns the image path (`/projects/{slug}.png`)

### `GET /api/github/repo?url=<github-url>`
- Requires valid session cookie
- Parses owner/repo from the URL
- Calls `GET /repos/{owner}/{repo}` and `GET /repos/{owner}/{repo}/languages`
- Returns: `{ title, tagline, tech[] }`

---

## Auth & Security

- Password checked server-side only
- Session cookie: `httpOnly`, `secure`, `sameSite: strict`, signed as a JWT using `jose` library with `ADMIN_SECRET` env var
- All `/api/admin/*` routes validate the session cookie before executing
- `/admin/dashboard` page redirects to `/admin` if cookie is missing or invalid
- No rate limiting needed for a personal site (not public-facing auth)

---

## Environment Variables

```
ADMIN_PASSWORD=your-chosen-password
ADMIN_SECRET=random-32-char-string-for-signing-cookies
GITHUB_TOKEN=ghp_...         # gh auth token
GITHUB_OWNER=erickmclark
GITHUB_REPO=portfolio
```

---

## Verification

1. Set env vars in `.env.local`
2. `npm run dev` — visit `http://localhost:3000/admin`
3. Enter wrong password → error shown, no redirect
4. Enter correct password → redirect to `/admin/dashboard`
5. Reload `/admin/dashboard` directly → stays on dashboard (cookie persists)
6. Edit a project title → click "Save & Deploy" → check GitHub repo for updated `content/data.json` commit
7. Paste a GitHub repo URL → "Fetch from GitHub" → title/tagline/tech auto-filled
8. Drag projects to reorder → save → verify order in `data.json`
9. Upload an image → verify it appears in `public/projects/` on GitHub
10. Visit the public site after Netlify redeploys → confirm content matches what was saved in admin
