import { ImageResponse } from 'next/og';
import { getSiteContent } from '@/lib/content';

export const alt = 'Project';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const { projects, about } = await getSiteContent();
  const project = projects.find((p) => p.slug === slug);

  const title = project?.title ?? about.name;
  const tagline = project?.tagline ?? '';
  const tech = (project?.tech ?? []).slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0a0a0a',
          backgroundImage:
            'radial-gradient(circle at 20% 0%, rgba(59,130,246,0.18), transparent 45%)',
          color: '#f5f5f5',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            color: '#3b82f6',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {about.name}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginTop: 16,
          }}
        >
          {title}
        </div>
        {tagline ? (
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              color: '#a3a3a3',
              marginTop: 24,
              maxWidth: 980,
              lineHeight: 1.35,
            }}
          >
            {tagline}
          </div>
        ) : null}
        {tech.length ? (
          <div style={{ display: 'flex', fontSize: 24, color: '#6b6b6b', marginTop: 36 }}>
            {tech.join('   ·   ')}
          </div>
        ) : null}
      </div>
    ),
    { ...size }
  );
}
