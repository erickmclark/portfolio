const skills = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Go",
  "Python",
  "PostgreSQL",
  "Redis",
  "Docker",
  "AWS",
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6 bg-surface">
      <div className="max-w-site mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          About
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-6">
              Who I Am
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                I&apos;m a software engineer with X years of experience building
                full-stack web applications. I specialize in TypeScript, React,
                and Node.js — and I care deeply about performance, clean
                architecture, and developer experience.
              </p>
              <p>
                Previously at [Company A] and [Company B], where I worked on
                [brief description of impact]. I&apos;m currently [status —
                looking for new opportunities / freelancing / open to
                collaborations].
              </p>
              <p>
                Outside of code: [one personal detail — hiking, music, coffee,
                etc.].
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold tracking-widest uppercase text-muted mb-4">
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm px-3 py-1.5 rounded-full border border-border text-white hover:border-accent transition-colors duration-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-64 h-64 rounded-2xl bg-border border border-border flex items-center justify-center text-muted text-sm">
              Your Photo
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
