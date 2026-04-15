import Image from 'next/image';
import { getSiteContent } from '@/lib/content';

export default function About() {
  const { about } = getSiteContent();

  const initials = about.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <section id="about" className="py-24 px-6 bg-surface">
      <div className="max-w-site mx-auto">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">
          About
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-8">
              Who I Am
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              {about.bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-10">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm px-3 py-1.5 rounded-lg border border-border text-foreground hover:border-accent/60 hover:text-accent hover:bg-accent/5 transition-colors duration-200 cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent/20 via-transparent to-transparent blur-xl" />
              <div className="relative w-72 h-72 rounded-3xl border border-border overflow-hidden bg-gradient-to-br from-accent/20 via-surface to-border">
                {about.photo ? (
                  <Image
                    src={about.photo}
                    alt={about.name}
                    fill
                    className="object-cover"
                    sizes="288px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl font-black text-accent/60 select-none">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-5 -right-5 bg-background border border-border rounded-2xl px-4 py-3 shadow-xl">
                <p className="text-2xl font-black text-foreground leading-none">{about.skills.length}+</p>
                <p className="text-xs text-muted mt-0.5">Technologies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
