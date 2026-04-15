import { getSiteContent } from '@/lib/content';

export default function Hero() {
  const { about } = getSiteContent();

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center px-6 pt-[72px]"
    >
      <div className="max-w-site mx-auto w-full">
        {about.availableForWork && (
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
            Available for work
          </p>
        )}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6">
          {about.name}.
          <br />
          <span className="text-muted">Software Engineer.</span>
        </h1>
        <p className="text-xl text-muted max-w-xl mb-10 leading-relaxed">
          I build fast, reliable web products — from APIs to polished UIs.
          Currently open to full-time roles and freelance projects.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="#projects"
            className="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors duration-200"
          >
            View My Work
          </a>
          <a
            href="#contact"
            className="inline-flex items-center px-6 py-3 border border-border hover:border-accent text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Contact Me
          </a>
        </div>
      </div>
    </section>
  );
}
