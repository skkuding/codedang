import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { auth } from '@/libs/auth'
import { fetcherWithAuth } from '@/libs/utils'
import type { ContestTop, ProblemDataTop } from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { QnAMainTable } from './_components/QnAMainTable'

interface ContestQnAProps {
  params: Promise<{ contestId: string }>
  searchParams: Promise<{
    registered: string
    search: string
    orderBy: string
    categories?: string
    problemOrders?: string
  }>
}

export default async function ContestQna(props: ContestQnAProps) {
  const { contestId } = await props.params
  const { searchParams } = props
  const session = await auth()
  const registered = (await searchParams).registered === 'true'
  const search = (await searchParams).search ?? ''
  const orderBy = (await searchParams).orderBy ?? 'desc'
  const categories = (await searchParams).categories ?? ''
  const problemOrders = (await searchParams).problemOrders ?? ''
  const contest: ContestTop = await fetcherWithAuth
    .get(`contest/${contestId}`)
    .json()
  const contestProblems: ProblemDataTop = await fetcherWithAuth
    .get(`contest/${contestId}/problem`)
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
    session &&
    (contest.isRegistered || contest.isPrivilegedRole || state !== 'Ongoing')
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
            contestProblems={contestProblems}
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
    <div className="w-[1133px]">
      <Skeleton className="h-[34px] w-[235px] gap-4" />
      <div className="mt-[140px] flex">
        <span className="w-2/12">
          <Skeleton className="h-6 w-20" />
        </span>
        <span className="w-2/12">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-4/12">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-2/12">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
        <span className="w-2/12">
          <Skeleton className="mx-auto h-6 w-20" />
        </span>
      </div>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="my-10 flex h-8 w-full rounded-xl" />
      ))}
    </div>
  )
}
