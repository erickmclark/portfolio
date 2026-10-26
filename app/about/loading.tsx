import { Bar, HeadSkeleton, SkeletonMain } from "@/components/page-skeleton";

export default function Loading() {
  return (
    <SkeletonMain>
      <div className="border-t border-ink">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
          <HeadSkeleton />
          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,602px)_minmax(0,1fr)] lg:gap-[72px]">
            <div className="border-t border-ink py-6">
              <Bar className="h-2.5 w-6" />
              <Bar className="mt-4 h-9 w-3/5 sm:h-11" />
              <Bar className="mt-4 h-3 w-full" />
              <Bar className="mt-2 h-3 w-4/5" />
            </div>
            <div className="hidden self-center border border-ink/20 bg-ink/[0.06] p-10 lg:block skeleton-pulse">
              <div className="h-64" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonMain>
  );
}
