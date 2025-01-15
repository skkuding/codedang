import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Separator } from '@/components/shadcn/separator'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { ErrorBoundary } from '@suspensive/react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { SearchBar } from '../_components/SearchBar'
import { ContestCardList } from './_components/ContestCardList'
import { FinishedContestTable } from './_components/FinishedContestTable'
import { RegisteredContestTable } from './_components/RegisteredContestTable'
import { TableSwitchButton } from './_components/TableSwitchButton'

interface ContestProps {
  searchParams: {
    registered: string
    search: string
  }
}

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

export default async function Contest({ searchParams }: ContestProps) {
  const session = await auth()
  const registered = searchParams.registered === 'true'
  if (!session && registered) {
    redirect('/contest')
  }
  const search = searchParams.search ?? ''

  return (
    <>
      <div className="mb-12 flex flex-col gap-12">
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<ContestCardListFallback />}>
            <ContestCardList
              title="Join the contest now!"
              type="Ongoing"
              session={session}
            />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<ContestCardListFallback />}>
            <ContestCardList
              title="Check out upcoming contests"
              type="Upcoming"
              session={session}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
      <div className="flex-col">
        <h1 className="mb-6 text-2xl font-bold text-gray-700">
          List of Contests
        </h1>

        <Suspense fallback={<FinishedContestTableFallback />}>
          {session ? (
            <TableSwitchButton registered={registered} />
          ) : (
            <p className="text-primary-light border-primary-light w-fit border-b-2 p-6 text-xl font-bold md:text-2xl">
              Finished
            </p>
          )}
          <Separator className="mb-3" />
          <ErrorBoundary fallback={FetchErrorFallback}>
            <div className="flex justify-end py-8">
              <SearchBar className="w-60" />
            </div>
            {session && registered ? (
              <RegisteredContestTable search={search} />
            ) : (
              <FinishedContestTable search={search} session={session} />
            )}
          </ErrorBoundary>
        </Suspense>
      </div>
    </>
  )
}
