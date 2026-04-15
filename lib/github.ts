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
