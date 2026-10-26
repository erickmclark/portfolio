import { Bar, CardSkeleton, HeadSkeleton, SkeletonMain } from "@/components/page-skeleton";

export default function Loading() {
  return (
    <SkeletonMain>
      <div className="border-t border-ink">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
          <HeadSkeleton />
          <div className="mt-10 flex flex-col gap-2 sm:max-w-sm">
            <div className="flex h-4 items-center">
              <Bar className="h-2.5 w-16" />
            </div>
            <Bar className="h-11 w-full rounded-full" />
          </div>
          <div className="mt-4 flex h-[33px] items-center border-b border-ink pb-4">
            <Bar className="h-2.5 w-64 max-w-full" />
          </div>
          <div className="mt-14 grid gap-x-8 gap-y-16 lg:grid-cols-2">
            <CardSkeleton />
            <div className="hidden lg:block">
              <CardSkeleton />
            </div>
          </div>
        </div>
      </div>
    </SkeletonMain>
  );
}
