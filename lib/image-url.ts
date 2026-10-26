/** Same-origin path or absolute https URL. Pure: safe for client and server. */
export function isAllowedImageUrl(url: string): boolean {
  if (typeof url !== 'string' || url === '') return false;
  if (url.startsWith('/')) return !url.startsWith('//') && !url.startsWith('/\\');
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Absolute https URL only (no same-origin paths). Pure: safe for client and server. */
export function isAbsoluteHttpsUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}
