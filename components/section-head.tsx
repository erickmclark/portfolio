export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted ${className}`}>
      {children}
    </p>
  );
}

export default function SectionHead({
  eyebrow,
  heading,
  lede,
  headingId,
  level = 2,
}: {
  eyebrow: string;
  heading: string;
  lede?: string;
  headingId: string;
  level?: 1 | 2;
}) {
  const H = level === 1 ? "h1" : "h2";
  return (
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <H
        id={headingId}
        className="mt-6 max-w-[1100px] font-display text-[40px] font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-6xl lg:text-[80px] lg:tracking-[-0.025em]"
      >
        {heading}
      </H>
      {lede && (
        <p className="mt-5 max-w-[760px] text-xl font-medium leading-[1.3] text-ink sm:text-[26px]">{lede}</p>
      )}
    </div>
  );
}
