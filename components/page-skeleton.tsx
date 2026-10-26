// Loading skeleton primitives. Server-safe, decorative: every block is aria-hidden.
// Line wrappers match the real line-height so the loaded content shifts as little as possible.

export function SkeletonMain({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="public-shell" aria-busy="true">
      <p className="sr-only" role="status">
        Loading
      </p>
      <div aria-hidden="true">{children}</div>
    </main>
  );
}

export function Bar({ className = "" }: { className?: string }) {
  return <div className={`skeleton-pulse bg-ink/10 ${className}`} />;
}

// One text line: wrapper height equals the real line box, bar fills ~70% of it.
function Line({ lineClass, widthClass }: { lineClass: string; widthClass: string }) {
  return (
    <div className={`flex items-center ${lineClass}`}>
      <Bar className={`h-[70%] ${widthClass}`} />
    </div>
  );
}

export function EyebrowSkeleton() {
  return (
    <div className="flex h-[17px] items-center">
      <Bar className="h-2.5 w-32" />
    </div>
  );
}

export function HeadSkeleton({ lede = true }: { lede?: boolean }) {
  return (
    <div>
      <EyebrowSkeleton />
      <div className="mt-6 max-w-[1100px]">
        <Line lineClass="h-[41px] sm:h-[61px] lg:h-[82px]" widthClass="w-4/5" />
        <Line lineClass="h-[41px] sm:h-[61px] lg:h-[82px]" widthClass="w-2/5" />
      </div>
      {lede && (
        <div className="mt-5 max-w-[760px]">
          <Line lineClass="h-[26px] sm:h-[34px]" widthClass="w-full" />
          <Line lineClass="h-[26px] sm:h-[34px]" widthClass="w-3/5" />
        </div>
      )}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div>
      <div className="flex h-4 items-center">
        <Bar className="h-2.5 w-48" />
      </div>
      <div className="mt-4 aspect-[16/10] w-full border border-ink/20 bg-ink/[0.06] skeleton-pulse" />
      <div className="mt-5 h-8 flex items-center">
        <Bar className="h-5 w-3/5" />
      </div>
    </div>
  );
}
