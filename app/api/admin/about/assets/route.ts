import { NextRequest, NextResponse } from 'next/server';
import { del, put } from '@vercel/blob';
import { isAuthenticated } from '@/lib/auth';
import { getRedis } from '@/lib/content';
import { validateSiteContent } from '@/lib/validate';
import {
  MAX_IMAGE_BYTES,
  MAX_RESUME_BYTES,
  aboutAssetPath,
  readStoredContent,
  sniffImageType,
  sniffPdf,
} from '@/lib/project-images';

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

// Uploads the About photo or résumé PDF to Blob and writes the URL to KV.
// The previous blob is never deleted here (known limitation: it is orphaned).
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return fail('Unauthorized', 401);
  try {
    const form = await request.formData();
    const kind = form.get('kind');
    const file = form.get('file');
    if (kind !== 'photo' && kind !== 'resume') return fail('kind must be "photo" or "resume".', 400);
    if (!(file instanceof File)) return fail('A file is required.', 400);
    const max = kind === 'photo' ? MAX_IMAGE_BYTES : MAX_RESUME_BYTES;
    const tooLarge = kind === 'photo' ? 'Image is too large (4 MB maximum).' : 'PDF is too large (4 MB maximum).';
    if (file.size > max) return fail(tooLarge, 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length > max) return fail(tooLarge, 400);

    let path: string;
    let contentType: string;
    if (kind === 'photo') {
      const type = sniffImageType(bytes);
      if (!type) return fail('Unsupported image. Use PNG, JPEG, GIF, WebP or AVIF.', 400);
      path = aboutAssetPath('photo', type.ext);
      contentType = type.contentType;
    } else {
      if (!sniffPdf(bytes)) return fail('Unsupported file. Upload a PDF.', 400);
      path = aboutAssetPath('resume');
      contentType = 'application/pdf';
    }

    const redis = getRedis();
    if (!redis) return fail('Content store (KV) is not configured', 500);
    const blob = await put(path, file, { access: 'public', addRandomSuffix: true, contentType });

    // The upload is slow: commit against a fresh read so a Save that landed meanwhile survives.
    try {
      const stored = await readStoredContent(redis);
      if ('error' in stored) {
        await del(blob.url).catch(() => {});
        return fail(stored.error, 500);
      }
      const about = {
        ...stored.content.about,
        ...(kind === 'photo' ? { photo: blob.url } : { resumeUrl: blob.url }),
      };
      const result = validateSiteContent({ ...stored.content, about });
      if (!result.ok) {
        await del(blob.url).catch(() => {});
        return NextResponse.json(
          { error: `Invalid content: ${result.errors.join(' ')}`, errors: result.errors },
          { status: 400 },
        );
      }
      await redis.set('data', JSON.stringify(result.content));
      return NextResponse.json({ url: blob.url, about: result.content.about });
    } catch (e) {
      await del(blob.url).catch(() => {});
      throw e;
    }
  } catch (e) {
    return fail(String(e), 500);
  }
}
