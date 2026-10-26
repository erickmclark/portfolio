/** The element id when href is a hash link to the page we are already on, else null. */
export function sameDocumentHashId(href: string, pathname: string): string | null {
  const i = href.indexOf('#');
  if (i < 0 || href.slice(0, i) !== pathname) return null;
  const id = href.slice(i + 1);
  return id || null;
}

/** The element id named by a location.hash: decoded, the raw id if it is malformed, null if empty. */
export function hashTargetId(hash: string): string | null {
  const raw = hash.replace(/^#/, '');
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
