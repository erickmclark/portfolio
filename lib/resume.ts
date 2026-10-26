const BLOB_HOST_SUFFIX = '.public.blob.vercel-storage.com';

/** Href that makes the browser save the résumé instead of displaying it. Pure: safe for client and server. */
export function resumeDownloadHref(url: string): string {
  if (typeof url !== 'string') return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith(BLOB_HOST_SUFFIX)) return url;
    parsed.searchParams.set('download', '1');
    return parsed.toString();
  } catch {
    return url;
  }
}
