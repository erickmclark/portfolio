# Portfolio Site — Claude Context

## Project overview
Next.js 16 App Router portfolio site with a password-protected admin dashboard. Content is stored in Netlify Blobs (runtime) with `content/data.json` as a local dev fallback. Images are stored in the GitHub repo under `public/projects/`.

## Architecture

### Content storage
- **Runtime (production):** Netlify Blobs, store name `site-content`, key `data`
- **Local dev fallback:** `content/data.json` (read via `fs.readFileSync`)
- `lib/content.ts` → `getSiteContent()` is **async** — always `await` it
- All server components that call `getSiteContent()` must be `async` functions

### Why Netlify Blobs
Content saves from the admin used to write to GitHub, triggering a Netlify rebuild on every save (~60s, uses build minutes). Switching to Blobs means admin saves are instant and free — GitHub is only pushed when actual code changes are made.

### Admin panel
- Login: `POST /api/admin/auth` — validates `ADMIN_PASSWORD`, sets a signed JWT cookie (`admin_session`, 7-day expiry, `jose` HS256)
- Content API: `GET/PUT /api/admin/content` — reads/writes Netlify Blobs
- Image upload: `POST /api/admin/image` — uploads to GitHub repo via `putRepoImage()` in `lib/github.ts`
- No SHA tracking needed for content saves (Blobs has no SHA concept)

### Image uploads
Images still go to GitHub (`public/projects/{slug}.png`) via the GitHub Contents API. `putRepoImage()` auto-fetches the existing file SHA before uploading to avoid 409 conflicts.

## Key files
| File | Purpose |
|------|---------|
| `lib/types.ts` | TypeScript types: `Project`, `AboutContent`, `ContactContent`, `SiteContent` |
| `lib/content.ts` | `getSiteContent()` — async, reads Blobs then falls back to file |
| `lib/github.ts` | GitHub API helpers: `putRepoImage`, `getRepoInfo` |
| `lib/auth.ts` | JWT sign/verify, `isAuthenticated()` |
| `content/data.json` | Local dev seed data and fallback |
| `app/api/admin/content/route.ts` | GET/PUT content via Blobs |
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
ADMIN_PASSWORD=...         # password for admin login
ADMIN_SECRET=...           # 32-byte base64 secret for JWT signing
GITHUB_TOKEN=...           # fine-grained PAT with repo contents write access
GITHUB_OWNER=erickmclark
GITHUB_REPO=portfolio
```

## Local dev
- Run with `npm run dev` (uses `data.json` fallback since Netlify Blobs isn't available)
- To test Blobs locally, use `netlify dev` instead (requires Netlify CLI)
- TypeScript check: `npx tsc --noEmit`

## Pages and rendering
- Public pages are **cached**, not `force-dynamic`. `lib/content.ts` exports two loaders:
  - `getSiteContent()` — wrapped in `unstable_cache` with tag `site-content`; used by all public pages/components so reads don't hit Netlify Blobs on every request.
  - `getSiteContentUncached()` — raw read; used by the admin content `GET` (always edit fresh data) and in tests.
- The admin save (`PUT /api/admin/content`) calls `revalidateTag('site-content')`, so published edits go live immediately even though pages are cached.
- `app/projects/[slug]/page.tsx` uses `generateStaticParams()` to prerender a page + OG image per project; unknown slugs render on-demand and cache.
- All public-facing components (`hero`, `projects`, `about`, `contact`, `footer`) are **async server components**.
- SEO/files: `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` (home card), `app/projects/[slug]/opengraph-image.tsx` (per-project card).

## Netlify deployment
- Site name: **clarkport** (`clarkport.netlify.app`)
- GitHub repo: `erickmclark/portfolio`
- Netlify rebuilds only when code is pushed to `main` — content saves do NOT trigger builds
- Netlify Blobs data persists across redeploys (site-scoped store)
