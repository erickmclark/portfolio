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
): Promise<string> {
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
  const data = await res.json() as { content: { sha: string } };
  return data.content.sha;
}

export async function putRepoImage(slug: string, imageBase64: string, sha?: string): Promise<string> {
  const path = `public/projects/${slug}.png`;
  const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  // If no sha provided, check if the file already exists on GitHub and fetch its sha
  let fileSha = sha;
  if (!fileSha) {
    const check = await fetch(
      `${BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`,
      { headers: ghHeaders(), cache: 'no-store' }
    );
    if (check.ok) {
      const existing = await check.json() as { sha: string };
      fileSha = existing.sha;
    }
  }

  const body: Record<string, string> = {
    message: `feat: update image for project ${slug}`,
    content: base64,
  };
  if (fileSha) body.sha = fileSha;

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

/**
 * Move a project image when its slug changes: copy the file to the new
 * slug-derived path, then delete the old one. No-ops (without error) when the
 * source file doesn't exist — e.g. a project whose image was never uploaded.
 */
export async function moveRepoImage(
  fromSlug: string,
  toSlug: string
): Promise<{ moved: boolean; imagePath: string }> {
  const repo = `${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`;
  const fromPath = `public/projects/${fromSlug}.png`;
  const toPath = `public/projects/${toSlug}.png`;
  const imagePath = `/projects/${toSlug}.png`;

  // 1. Fetch the source file. If it's not there, nothing to move.
  const srcRes = await fetch(`${BASE}/repos/${repo}/contents/${fromPath}`, {
    headers: ghHeaders(),
    cache: 'no-store',
  });
  if (!srcRes.ok) return { moved: false, imagePath };
  const src = await srcRes.json() as { content: string; sha: string };
  const content = src.content.replace(/\s/g, ''); // GitHub returns base64 with newlines

  // 2. Look up the destination SHA so we can overwrite if something is already there.
  let destSha: string | undefined;
  const destRes = await fetch(`${BASE}/repos/${repo}/contents/${toPath}`, {
    headers: ghHeaders(),
    cache: 'no-store',
  });
  if (destRes.ok) destSha = ((await destRes.json()) as { sha: string }).sha;

  // 3. Write the file at the new path.
  const putBody: Record<string, string> = {
    message: `chore: move project image ${fromSlug} → ${toSlug}`,
    content,
  };
  if (destSha) putBody.sha = destSha;
  const putRes = await fetch(`${BASE}/repos/${repo}/contents/${toPath}`, {
    method: 'PUT',
    headers: ghHeaders(),
    body: JSON.stringify(putBody),
  });
  if (!putRes.ok) {
    throw new Error(`GitHub image move (PUT) failed: ${putRes.status} — ${await putRes.text()}`);
  }

  // 4. Delete the old file.
  const delRes = await fetch(`${BASE}/repos/${repo}/contents/${fromPath}`, {
    method: 'DELETE',
    headers: ghHeaders(),
    body: JSON.stringify({
      message: `chore: remove old project image ${fromSlug}`,
      sha: src.sha,
    }),
  });
  if (!delRes.ok) {
    throw new Error(`GitHub image move (DELETE) failed: ${delRes.status} — ${await delRes.text()}`);
  }

  return { moved: true, imagePath };
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
