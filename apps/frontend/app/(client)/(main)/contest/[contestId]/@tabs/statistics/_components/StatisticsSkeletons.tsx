import { Skeleton } from '@/components/shadcn/skeleton'

export function ProblemStatisticsSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="mb-4 h-8 w-48 rounded-xl bg-gray-200" />
      <div className="mb-3 flex h-[98px] gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-1/4 rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="mb-5 flex h-[188px] gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-1/4 rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="mb-[112px] flex h-[338px] gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="w-1/2 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

export function ProblemStatisticsSkeletonWithSidebar() {
  return (
    <div className="flex animate-pulse gap-7">
      <div className="h-25 w-[276px] shrink-0 rounded-2xl bg-gray-100" />
      <ProblemStatisticsSkeleton />
    </div>
  )
}

export function RealtimeLearBoardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="mb-4 flex h-[104px] w-full justify-around gap-2">
        <Skeleton className="w-70 h-[104px]" />
        <Skeleton className="w-70 h-[104px]" />
        <Skeleton className="w-70 h-[104px]" />
        <Skeleton className="h-[104px] w-[304px]" />
      </div>
      <Skeleton className="h-[68px] w-full" />
      <div className="mt-15 flex w-full flex-col gap-2">
        <div className="flex h-10 w-full justify-around gap-1">
          <Skeleton className="w-15 h-10 rounded-full" />
          <Skeleton className="w-15 h-10 rounded-full" />
          <Skeleton className="w-55 h-10 rounded-full" />
          <Skeleton className="w-30 h-10 rounded-full" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
        <Skeleton className="h-18 w-full rounded-full" />
        <Skeleton className="h-18 w-full rounded-full" />
        <Skeleton className="h-18 w-full rounded-full" />
        <Skeleton className="h-18 w-full rounded-full" />
        <Skeleton className="h-18 w-full rounded-full" />
      </div>
    </div>
  )
}
