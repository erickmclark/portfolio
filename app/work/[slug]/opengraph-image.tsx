import { ImageResponse } from 'next/og';
import { getSiteContent, publicProjects } from '@/lib/content';
import { cardSize, homeBlue, loadCardFonts, resolvePhoto, ShareCard } from '@/lib/share-card';

export const alt = 'Case study - Erick Clark';
export const size = cardSize;
export const contentType = 'image/png';

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const { projects, about } = await getSiteContent();
  const project = publicProjects(projects).find((p) => p.slug === slug);
  const [fonts, photo] = await Promise.all([loadCardFonts(), resolvePhoto(about.photo)]);

  const title = project?.title ?? '';
  const tagline = project?.tagline ?? '';
  const titleSize = title.length > 48 ? 40 : title.length > 28 ? 52 : title.length > 14 ? 64 : 80;

  const { top, bottom } = project
    ? {
        top: (
          <div
            style={{
              display: 'flex',
              width: '100%',
              fontFamily: 'Geist Mono',
              fontWeight: 500,
              fontSize: 16,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Case study · iamerickclark.com
          </div>
        ),
        bottom: (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Funnel Display',
                fontWeight: 700,
                fontSize: titleSize,
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
              }}
            >
              {title}
            </div>
            {tagline ? (
              <div
                style={{
                  display: 'flex',
                  marginTop: 24,
                  fontFamily: 'Funnel Sans',
                  fontWeight: 600,
                  fontSize: tagline.length > 90 ? 20 : 25,
                  lineHeight: 1.25,
                  maxHeight: 130,
                  overflow: 'hidden',
                }}
              >
                {tagline}
              </div>
            ) : null}
          </div>
        ),
      }
    : homeBlue(about.name, about.title);

  return new ImageResponse(<ShareCard photo={photo} top={top} bottom={bottom} />, { ...size, fonts });
}
