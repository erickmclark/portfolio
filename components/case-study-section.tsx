import ReactMarkdown from "react-markdown";

export default function CaseStudySection({
  number,
  title,
  body,
  id,
}: {
  number?: string;
  title: string;
  body: string;
  id: string;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-ink py-10 sm:py-14">
      <div className="mx-auto grid max-w-[1440px] gap-4 px-4 sm:px-10 lg:grid-cols-[320px_1fr] lg:gap-16">
        <div>
          {number && <p className="font-mono text-[11px] font-medium tracking-[0.1em] text-ink-muted">{number}</p>}
          <h2 id={id} className="mt-1 font-display text-2xl font-bold leading-tight tracking-[-0.03em] sm:text-[28px]">
            {title}
          </h2>
        </div>
        <div className="max-w-[760px] text-[17px] leading-relaxed text-ink">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-5">{children}</ul>,
              ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-5">{children}</ol>,
              a: ({ href, children }) => (
                <a href={href} className="underline underline-offset-4">
                  {children}
                </a>
              ),
            }}
          >
            {body}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
