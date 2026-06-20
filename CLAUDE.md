# Portfolio Site — Claude Context

## Project overview
Next.js 16 App Router portfolio site with a password-protected admin dashboard. Content is stored in Upstash Redis (Vercel Marketplace "KV") at runtime with `content/data.json` as a local-dev fallback. Images are stored in the GitHub repo under `public/projects/`. Hosted on Vercel.

## Architecture

### Content storage
- **Runtime (production):** Upstash Redis (Vercel "KV"), key `data` holding the JSON `SiteContent`
- **Local dev fallback:** `content/data.json` (read via `fs.readFileSync` when KV env vars are absent)
- `lib/content.ts` → `getRedis()` builds the client with `automaticDeserialization: false` (stores/returns strings, like the old Blobs store, so we keep explicit `JSON.parse`/`stringify`); `getSiteContent()` is **async** — always `await` it
- All server components that call `getSiteContent()` must be `async` functions

### Why a runtime KV store
Content saves from the admin used to write to GitHub, triggering a rebuild on every save (~60s). A runtime key/value store (Upstash Redis) makes admin saves instant — GitHub is only pushed when actual code changes are made or an image is uploaded.

### Admin panel
- Login: `POST /api/admin/auth` — validates `ADMIN_PASSWORD`, sets a signed JWT cookie (`admin_session`, 7-day expiry, `jose` HS256)
- Content API: `GET/PUT /api/admin/content` — reads/writes Upstash Redis (KV) via `getRedis()`
- Image upload: `POST /api/admin/image` — uploads to GitHub repo via `putRepoImage()` in `lib/github.ts`
- No SHA tracking needed for content saves (the KV store is a simple key/value)

### Image uploads
Images still go to GitHub (`public/projects/{slug}.png`) via the GitHub Contents API. `putRepoImage()` auto-fetches the existing file SHA before uploading to avoid 409 conflicts.

## Key files
| File | Purpose |
|------|---------|
| `lib/types.ts` | TypeScript types: `Project`, `AboutContent`, `ContactContent`, `SiteContent` |
| `lib/content.ts` | `getRedis()` + `getSiteContent()` — async, reads Upstash KV then falls back to file |
| `lib/site.ts` | `SITE_URL` — canonical URL from `NEXT_PUBLIC_SITE_URL` (metadata/sitemap/robots/OG) |
| `lib/github.ts` | GitHub API helpers: `putRepoImage`, `getRepoInfo` |
| `lib/auth.ts` | JWT sign/verify, `isAuthenticated()` |
| `content/data.json` | Local dev seed data and fallback |
| `app/api/admin/content/route.ts` | GET/PUT content via Upstash KV |
| `app/api/admin/image/route.ts` | POST image upload to GitHub |
| `app/admin/dashboard/dashboard-client.tsx` | Admin shell — tabs, save button |
| `app/admin/dashboard/projects-tab.tsx` | DnD project editor with image lightbox |
| `app/admin/dashboard/about-tab.tsx` | Name, title, hero tagline, photo upload, bio, skills |
| `app/admin/dashboard/contact-tab.tsx` | Email, GitHub URL, LinkedIn URL |

## Data shape (`AboutContent`)
```ts
{
  name: string           // shown in nav and hero
  title: string          // role shown in hero, e.g. "Software Engineer"
  heroTagline: string    // paragraph below name/title on homepage
  availableForWork: boolean
  photo?: string         // path to profile photo, e.g. /projects/about-profile.png
  bio: string[]          // paragraphs shown in About section
  skills: string[]
}
```

## Environment variables
```
ADMIN_PASSWORD=...           # password for admin login
ADMIN_SECRET=...             # 32-byte base64 secret for JWT signing
GITHUB_TOKEN=...             # fine-grained PAT with repo contents write access
GITHUB_OWNER=erickmclark
GITHUB_REPO=portfolio
NEXT_PUBLIC_SITE_URL=...     # canonical production URL (e.g. https://clarkport.vercel.app)
KV_REST_API_URL=...          # Upstash Redis REST URL (auto-injected by the Vercel integration)
KV_REST_API_TOKEN=...        # Upstash Redis REST token (auto-injected)
```

## Local dev
- Run with `npm run dev` (uses the `data.json` fallback when KV env vars are absent)
- To exercise the real KV store locally, run `vercel env pull .env.local` to fetch `KV_REST_API_URL` / `KV_REST_API_TOKEN`
- TypeScript check: `npx tsc --noEmit`

## Pages and rendering
- `app/page.tsx` — `export const dynamic = 'force-dynamic'` (reads the KV store at request time, so admin saves are instant).
- `app/projects/[slug]/page.tsx` — `export const dynamic = 'force-dynamic'`, no `generateStaticParams` (dynamic because the project list can change from admin).
- `lib/content.ts` → `getSiteContent()` reads the KV store fresh every call (no caching). Tried `unstable_cache` + `revalidateTag` once, but on-demand purge wasn't instant on the host, so we kept `force-dynamic` for instant edits.
- All public-facing components (`hero`, `projects`, `about`, `contact`, `footer`) are **async server components**.
- SEO/files: `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` (home card), `app/projects/[slug]/opengraph-image.tsx` (per-project card).

## Vercel deployment
- GitHub repo: `erickmclark/portfolio` (Vercel Git integration → auto-deploy on push to `main`)
- Production URL: set via `NEXT_PUBLIC_SITE_URL` (a `*.vercel.app` subdomain, or a custom domain)
- Content store: Upstash Redis via the Vercel Marketplace integration (KV env vars auto-injected)
- Vercel rebuilds only when code is pushed to `main` (or an image is uploaded to the repo) — content saves do NOT trigger builds
- KV data persists independently of deploys
