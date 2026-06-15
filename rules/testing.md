# Testing

## Stack
[Vitest](https://vitest.dev) for unit and route tests. Run with:

```bash
npm test          # single run (CI)
npm run test:watch
```

Config lives in `vitest.config.ts` (node environment, `@/*` path alias mirrored from
`tsconfig.json`).

## What we test
The high-value, logic-heavy modules — not React rendering:

- `lib/auth.ts` — JWT sign/verify round-trip and `isAuthenticated()` cookie handling.
- `lib/content.ts` — `getSiteContent()` falls back to `content/data.json` when Netlify Blobs
  is unavailable and returns the expected shape.
- `lib/github.ts` — `putRepoImage()` fetches an existing file's SHA before PUT; `getRepoInfo()`
  formats the repo title and tech list. `fetch` is mocked.
- `app/api/admin/auth/route.ts` — 200 + `Set-Cookie` on the correct password, 401 on a wrong
  one, 500 when `ADMIN_PASSWORD` is unset.

## Conventions
- Co-locate test files next to source as `*.test.ts`.
- Mock external boundaries (`fetch`, `next/headers`, env vars) — never hit the real GitHub API
  or Netlify Blobs.
- Set required env vars (`ADMIN_SECRET`, `ADMIN_PASSWORD`) inside the test via `vi.stubEnv`.
