import { Bar, HeadSkeleton, SkeletonMain } from "@/components/page-skeleton";

export default function Loading() {
  return (
    <SkeletonMain>
      <div className="border-t border-ink">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
          <HeadSkeleton lede={false} />
          <div className="mt-14 grid gap-12 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-[72px]">
            <div>
              <Bar className="h-40 w-40 rounded-full" />
            </div>
            <div className="space-y-5">
              <Bar className="h-4 w-full" />
              <Bar className="h-4 w-11/12" />
              <Bar className="h-4 w-full" />
              <Bar className="h-4 w-3/5" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonMain>
  );
}
