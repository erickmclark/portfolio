import { getSiteContent } from '@/lib/content';
import { ArrowRight, Mail, FileText } from 'lucide-react';
import AnimateIn from './animate-in';

export default async function Hero() {
  const { about } = await getSiteContent();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center px-6 pt-[72px] overflow-hidden hero-grid"
    >
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />

      <div className="relative max-w-site mx-auto w-full">
        {about.availableForWork && (
          <AnimateIn delay={0} direction="none">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              Available for work
            </div>
          </AnimateIn>
        )}

        <AnimateIn delay={100} direction="up">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
            {about.name}.
            <br />
            <span className="text-muted">{about.title}.</span>
          </h1>
        </AnimateIn>

        <AnimateIn delay={220} direction="up">
          <p className="text-xl text-muted max-w-lg mb-10 leading-relaxed">
            {about.heroTagline}
          </p>
        </AnimateIn>

        <AnimateIn delay={340} direction="up">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:-translate-y-0.5"
            >
              View My Work
              <ArrowRight size={16} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border hover:border-accent/60 hover:bg-accent/5 text-white font-semibold rounded-lg transition-all duration-200"
            >
              <Mail size={16} className="text-muted" />
              Contact Me
            </a>
            {about.resumeUrl && (
              <a
                href={about.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border hover:border-accent/60 hover:bg-accent/5 text-white font-semibold rounded-lg transition-all duration-200"
              >
                <FileText size={16} className="text-muted" />
                Resume
              </a>
            )}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
