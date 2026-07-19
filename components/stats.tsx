import AnimateIn from './animate-in';

const STATS = [
  { value: '15+', label: 'Years in tech leadership' },
  { value: '$36M', label: 'Portfolio budget managed' },
  { value: '164', label: 'Employees supported' },
  { value: '7', label: 'AI products shipped' },
];

export default function Stats() {
  return (
    <section aria-label="Career highlights" className="border-y border-border bg-surface/50 px-6">
      <div className="max-w-site mx-auto grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 py-12">
        {STATS.map((stat, i) => (
          <AnimateIn key={stat.label} direction="up" delay={i * 80}>
            <div>
              <p className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="mt-1.5 text-sm text-muted">{stat.label}</p>
            </div>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
