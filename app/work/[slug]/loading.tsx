import { Bar, SkeletonMain } from "@/components/page-skeleton";

export default function Loading() {
  return (
    <SkeletonMain>
      <div className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-10">
        <div className="flex min-h-11 items-center">
          <Bar className="h-3 w-20" />
        </div>
        <div className="mt-4 flex h-4 items-center">
          <Bar className="h-2.5 w-48" />
        </div>
        <div className="mt-4 max-w-[1000px]">
          <div className="flex h-[41px] items-center sm:h-[61px] lg:h-[82px]">
            <Bar className="h-[70%] w-3/5" />
          </div>
        </div>
        <div className="mt-5 max-w-[760px]">
          <div className="flex h-[26px] items-center sm:h-[34px]">
            <Bar className="h-[70%] w-4/5" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-ink pt-4 sm:grid-cols-3 lg:grid-cols-5">
          <Bar className="h-9 w-3/5" />
          <Bar className="h-9 w-3/5" />
          <Bar className="hidden h-9 w-3/5 sm:block" />
        </div>
        <div className="mt-8 aspect-[16/10] w-full border border-ink/20 bg-ink/[0.06] skeleton-pulse" />
      </div>
    </SkeletonMain>
  );
}
