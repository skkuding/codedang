import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { fetcherWithAuth } from '@/libs/utils'
import type { ContestTop } from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { QnAMainTable } from './_components/QnAMainTable'

interface ContestProps {
  params: { contestId: string }
  searchParams: {
    registered: string
    search: string
    orderBy: string
    categories?: string
    problemOrders?: string
  }
  resetPageIndex: () => void
}

export default async function ContestQna({
  params,
  searchParams
}: ContestProps) {
  const { contestId } = params
  const session = await auth()
  const registered = searchParams.registered === 'true'
  const search = searchParams.search ?? ''
  const orderBy = searchParams.orderBy ?? 'desc'
  const categories = searchParams.categories ?? ''
  const problemOrders = searchParams.problemOrders ?? ''
  const contest: ContestTop = await fetcherWithAuth
    .get(`contest/${contestId}`)
    .json()
  const state = (() => {
    const currentTime = new Date()
    if (currentTime >= contest.endTime) {
      return 'Finished'
    }
    if (currentTime < contest.startTime) {
      return 'Upcoming'
    }
    return 'Ongoing'
  })()
  const canCreateQnA =
    contest.isRegistered || contest.isPrivilegedRole || state !== 'Ongoing'
  const isPrivilegedRole = contest.isPrivilegedRole
  if (!session && registered) {
    redirect(`/contest/${contestId}/qna`)
  }
  return (
    <div className="mb-[88px] mt-[80px] max-w-[1440px] px-[116px]">
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<QnATableFallback />}>
          <QnAMainTable
            contestId={contestId}
            search={search}
            orderBy={orderBy}
            categories={categories}
            problemOrders={problemOrders}
            session={session}
            isPrivilegedRole={isPrivilegedRole}
            canCreateQnA={canCreateQnA}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

function QnATableFallback() {
  return (
    <div className="w-[1133px] self-stretch">
      <Skeleton className="h-[34px] w-[235px] gap-4" />
      <div className="mt-[140px] flex">
        <span className="w-1/12">
          <Skeleton className="h-6 w-20" />
        </span>
        <span className="w-2/12">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-5/12">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-1/12">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-3/12">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
      </div>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="my-10 flex h-8 w-full rounded-xl" />
      ))}
    </div>
  )
}
