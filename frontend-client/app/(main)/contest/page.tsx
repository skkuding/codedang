import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'
import ContestCardList from './_components/ContestCardList'
import FinishedContestTable from './_components/FinishedContestTable'

function ContestCardListFallback() {
  return (
    <div>
      <Skeleton className="mb-8 h-8 w-24" />
      <div className="flex gap-8">
        <Skeleton className="h-[120px] w-[375px] rounded-xl" />
        <Skeleton className="h-[120px] w-[375px] rounded-xl" />
      </div>
    </div>
  )
}

function FinishedContestTableFallback() {
  return (
    <div>
      <Skeleton className="mb-8 h-8 w-24" />
      <div className="mt-4 flex">
        <span className="w-2/5 md:w-3/6">
          <Skeleton className="h-6 w-20" />
        </span>
        <span className="w-1/5 md:w-1/6">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-1/5 md:w-1/6">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-1/5 md:w-1/6">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
      </div>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="my-10 flex h-8 w-full rounded-xl" />
      ))}
    </div>
  )
}

export default function Contest() {
  return (
    <>
      <div className="mb-12 flex flex-col gap-12">
        <Suspense fallback={<ContestCardListFallback />}>
          <ContestCardList title="Join the contest now!" type="Ongoing" />
        </Suspense>
        <Suspense fallback={<ContestCardListFallback />}>
          <ContestCardList
            title="Check out upcoming contests"
            type="Upcoming"
          />
        </Suspense>
      </div>
      <Suspense fallback={<FinishedContestTableFallback />}>
        <FinishedContestTable />
      </Suspense>
    </>
  )
}
