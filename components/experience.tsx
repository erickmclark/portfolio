import { getSiteContent } from '@/lib/content';
import AnimateIn from './animate-in';

export default async function Experience() {
  const { experience } = await getSiteContent();

  if (experience.length === 0) return null;

  const items = [...experience].sort((a, b) => a.order - b.order);

  return (
    <section id="experience" className="py-24 px-6">
      <div className="max-w-site mx-auto">
        <AnimateIn direction="up">
          <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">
            Experience
          </p>
        </AnimateIn>

        <AnimateIn direction="up" delay={60}>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-12">
            Where I&apos;ve Worked
          </h2>
        </AnimateIn>

        <div className="max-w-3xl border-l border-border">
          {items.map((item, i) => (
            <AnimateIn key={item.id} direction="up" delay={100 + i * 80}>
              <div className="relative pl-8 pb-12 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-accent"
                />
                <p className="text-sm text-muted mb-1">
                  {item.start} — {item.end || 'Present'}
                </p>
                <h3 className="text-xl font-bold tracking-tight">
                  {item.role} <span className="text-accent">· {item.company}</span>
                </h3>
                {item.description && (
                  <p className="mt-3 text-muted leading-relaxed">{item.description}</p>
                )}
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
