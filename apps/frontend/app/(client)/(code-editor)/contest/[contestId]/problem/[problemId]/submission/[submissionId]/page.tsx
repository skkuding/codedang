'use client'

import { useSubmissionDetailSync } from '@/app/(client)/(code-editor)/_components/context/ReFetchingSubmissionDetailStoreProvider'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { ErrorBoundary } from '@suspensive/react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense, use } from 'react'
import { SubmissionDetail } from '../_components/SubmissionDetail'
import { SubmissionDetailTitle } from './_components/SubmissionDetailTitle'

export default function Page(props: {
  params: Promise<{
    problemId: string
    contestId: string
    submissionId: string
  }>
  searchParams: Promise<{
    cellProblemId?: string
  }>
}) {
  const searchParams = use(props.searchParams)
  const params = use(props.params)
  const { problemId, submissionId, contestId } = params
  const { cellProblemId } = searchParams
  const refreshTrigger = useSubmissionDetailSync(
    (state) => state.refreshTrigger
  )

  return (
    <div className="flex flex-col gap-5 overflow-auto py-6">
      <div className="z-20 flex items-center gap-3 px-6">
        <Link href={`/contest/${contestId}/problem/${problemId}/submission`}>
          <ArrowLeft className="size-5" />
        </Link>
        <SubmissionDetailTitle
          problemId={Number(cellProblemId)}
          contestId={Number(contestId)}
          submissionId={Number(submissionId)}
        />
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense
          fallback={
            <div className="flex h-fit flex-col gap-4 p-2 text-lg">
              <Skeleton className="h-20 w-full rounded-lg bg-slate-900" />
              <Skeleton className="h-8 w-3/12 rounded-lg bg-slate-900" />
              <Skeleton className="h-32 w-full rounded-lg bg-slate-900" />
            </div>
          }
        >
          <SubmissionDetail
            problemId={Number(cellProblemId)}
            contestId={Number(contestId)}
            submissionId={Number(submissionId)}
            refreshTrigger={refreshTrigger}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
