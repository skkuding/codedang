import SearchBar from '@/components/SearchBar'
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '@/lib/auth'
import { Suspense } from 'react'
import ContestCardList from './_components/ContestCardList'
import ContestInfiniteTable from './_components/ContestInfiniteTable'
import SwitchButton from './_components/SwitchButton'

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

interface ContestProps {
  searchParams: { search: string; registered: string }
}

export default async function Contest({ searchParams }: ContestProps) {
  const session = await auth()
  const search = searchParams.search ?? ''
  const registered = session ? searchParams?.registered ?? '' : ''

  return (
    <>
      <div className="mb-12 flex flex-col gap-12">
        <Suspense fallback={<ContestCardListFallback />}>
          <ContestCardList
            title="Join the contest now!"
            type="Ongoing"
            session={session}
          />
        </Suspense>
        <Suspense fallback={<ContestCardListFallback />}>
          <ContestCardList
            title="Check out upcoming contests"
            type="Upcoming"
            session={session}
          />
        </Suspense>
      </div>
      <Suspense fallback={<FinishedContestTableFallback />}>
        {session?.user ? (
          <>
            <div className="flex w-full justify-between">
              <SwitchButton />
              <SearchBar />
            </div>
          </>
        ) : (
          <>
            <div className="flex w-full justify-between">
              <p className="text-xl font-bold md:text-2xl">Finished</p>
              <SearchBar />
            </div>
          </>
        )}
        <ContestInfiniteTable
          search={search}
          registered={registered}
          session={session}
        />
      </Suspense>
    </>
  )
}
