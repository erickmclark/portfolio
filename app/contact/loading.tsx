import { Bar, SkeletonMain } from "@/components/page-skeleton";

export default function Loading() {
  return (
    <SkeletonMain>
      <div className="bg-white">
        <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-10 sm:py-20">
          <div className="flex h-[41px] items-center sm:h-[58px]">
            <Bar className="h-[70%] w-3/5" />
          </div>
          <div className="mt-5 max-w-[760px]">
            <div className="flex h-[24px] items-center sm:h-[27px]">
              <Bar className="h-[70%] w-full" />
            </div>
            <div className="flex h-[24px] items-center sm:h-[27px]">
              <Bar className="h-[70%] w-3/5" />
            </div>
          </div>
          <div className="mt-10 space-y-6">
            <Bar className="h-11 w-full" />
            <Bar className="h-11 w-full" />
            <Bar className="h-28 w-full" />
          </div>
        </div>
      </div>
    </SkeletonMain>
  );
}
