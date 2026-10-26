import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { absoluteImageUrl } from '@/lib/site';

export const cardSize = { width: 1200, height: 630 };

const INK = '#141414';

export async function loadCardFonts() {
  // Literal paths so Next's output file tracing bundles the fonts with the function.
  const [display, sans, mono] = await Promise.all([
    readFile(join(process.cwd(), 'assets/fonts/FunnelDisplay-700.ttf')),
    readFile(join(process.cwd(), 'assets/fonts/FunnelSans-600.ttf')),
    readFile(join(process.cwd(), 'assets/fonts/GeistMono-500.ttf')),
  ]);
  return [
    { name: 'Funnel Display', data: display, weight: 700 as const, style: 'normal' as const },
    { name: 'Funnel Sans', data: sans, weight: 600 as const, style: 'normal' as const },
    { name: 'Geist Mono', data: mono, weight: 500 as const, style: 'normal' as const },
  ];
}

const SATORI_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
// Matches the 4 MB admin upload limit; link-preview crawlers give up after a few seconds.
export const PHOTO_MAX_BYTES = 4 * 1024 * 1024;
const PHOTO_TIMEOUT_MS = 3000;

export async function resolvePhoto(photo?: string): Promise<string | null> {
  if (!photo) return null;
  // Fetched over HTTP: public/ files are not bundled with the function, and a failed fetch should drop the photo, not the card.
  try {
    const res = await fetch(absoluteImageUrl(photo), { signal: AbortSignal.timeout(PHOTO_TIMEOUT_MS) });
    const type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    // Satori decodes only these; any other type (avif, svg) throws and fails the whole card.
    if (!res.ok || !SATORI_IMAGE_TYPES.has(type)) return null;
    if (Number(res.headers.get('content-length')) > PHOTO_MAX_BYTES) return null;
    const bytes = await readCapped(res, PHOTO_MAX_BYTES);
    return bytes && `data:${type};base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
}

// content-length can be missing or wrong, so count the bytes as they arrive.
async function readCapped(res: Response, max: number): Promise<Buffer | null> {
  if (!res.body) return null;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return Buffer.concat(chunks);
    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
}

const mono = {
  fontFamily: 'Geist Mono',
  fontWeight: 500,
  fontSize: 16,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  display: 'flex',
};

// Right-hand tiles share one width so the two rows line up: (1200 - 520 - 4) / 2 - 2
const TILE = 336;

function ViewTile({ bg, k, v }: { bg: string; k: string; v: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: TILE,
        padding: 40,
        background: bg,
        color: INK,
      }}
    >
      <div style={mono}>{k}</div>
      <div
        style={{
          display: 'flex',
          fontFamily: 'Funnel Display',
          fontWeight: 700,
          fontSize: 38,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {v}
      </div>
    </div>
  );
}

export function ShareCard({
  photo,
  top,
  bottom,
}: {
  photo: string | null;
  top: React.ReactNode;
  bottom: React.ReactNode;
}) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', gap: 4, background: INK }}>
      <div
        style={{
          display: 'flex',
          width: 520,
          height: '100%',
          padding: 40,
          background: '#2b3bff',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%' }}>{top}{bottom}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', gap: 4 }}>
        <div style={{ display: 'flex', flex: 1, gap: 4 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: TILE,
              background: '#0a6e4b',
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                width={240}
                height={240}
                alt=""
                style={{ width: 240, height: 240, borderRadius: 120, objectFit: 'cover' }}
              />
            ) : null}
          </div>
          <ViewTile bg="#f2b705" k="View 01" v="IT Professional" />
        </div>
        <div style={{ display: 'flex', flex: 1, gap: 4 }}>
          <ViewTile bg="#e8e4dd" k="View 02" v="Consultant" />
          <ViewTile bg="#ff5a1f" k="View 03" v="Builder" />
        </div>
      </div>
    </div>
  );
}

export function homeBlue(name: string, title: string) {
  const [first, ...rest] = name.split(' ');
  return {
    top: <div style={{ ...mono, width: '100%' }}>iamerickclark.com</div>,
    bottom: (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Funnel Display',
            fontWeight: 700,
            fontSize: 108,
            letterSpacing: '-0.045em',
            lineHeight: 0.88,
          }}
        >
          <div style={{ display: 'flex' }}>{first}</div>
          {rest.length ? <div style={{ display: 'flex' }}>{rest.join(' ')}</div> : null}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            maxWidth: 400,
            fontFamily: 'Funnel Sans',
            fontWeight: 600,
            fontSize: 25,
            lineHeight: 1.25,
          }}
        >
          {title}
        </div>
      </div>
    ),
  };
}
