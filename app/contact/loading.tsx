import { Bar, SkeletonMain } from "@/components/page-skeleton";

const introLine = "flex h-[24.3px] items-center sm:h-[27px]";

export default function Loading() {
  return (
    <SkeletonMain>
      <div className="bg-white">
        <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-10 sm:py-20">
          <div>
            <div className="flex h-[37px] items-center sm:h-[57px]">
              <Bar className="h-[70%] w-4/5" />
            </div>
            <div className="flex h-[37px] items-center sm:h-[57px]">
              <Bar className="h-[70%] w-2/5" />
            </div>
          </div>
          <div className="mt-5 max-w-[760px]">
            <div className={introLine}>
              <Bar className="h-[70%] w-full" />
            </div>
            <div className={introLine}>
              <Bar className="h-[70%] w-full" />
            </div>
            <div className={introLine}>
              <Bar className="h-[70%] w-full sm:w-3/5" />
            </div>
            <div className={`${introLine} sm:hidden`}>
              <Bar className="h-[70%] w-full" />
            </div>
            <div className={`${introLine} sm:hidden`}>
              <Bar className="h-[70%] w-3/5" />
            </div>
          </div>
          <div className="mt-10">
            <div className="flex h-6 items-center">
              <Bar className="h-2.5 w-40" />
            </div>
            <Bar className="mt-3 h-12 w-full max-w-[420px] rounded-full" />
            <div className="mt-2 flex h-5 items-center">
              <Bar className="h-3 w-48" />
            </div>
            <div className="mt-8 border-t border-ink pt-6">
              <div className="flex h-[17px] items-center">
                <Bar className="h-2.5 w-36" />
              </div>
              <div className="mt-3 flex h-8 items-center sm:h-[37px]">
                <Bar className="h-[70%] w-72 max-w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonMain>
  );
}
