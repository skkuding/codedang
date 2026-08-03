import { Skeleton } from '@/components/shadcn/skeleton'

export function LeaderboardSkeleton() {
  return (
    <div className="relative ml-[116px] w-screen pb-[120px]">
      <div className="mt-[96px] flex flex-row items-center">
        <Skeleton className="h-[34px] w-[280px] rounded-md" />
        <Skeleton className="ml-8 h-8 w-8 rounded-full" />
      </div>
      <div className="mb-[62px] mt-[30px]">
        <Skeleton className="h-[52px] w-[600px] rounded-full" />
      </div>
      <div className="flex flex-col">
        <div className="flex flex-row space-x-1 pb-[22px]">
          <Skeleton className="h-[38px] w-[86px] rounded-full" />
          <Skeleton className="h-[38px] w-[264px] rounded-full" />
          <Skeleton className="h-[38px] w-[400px] rounded-full" />
        </div>
        <div className="flex flex-col gap-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-[90px] w-full rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
