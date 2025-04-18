import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { ErrorBoundary } from '@suspensive/react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { SubmissionDetail } from '../_components/SubmissionDetail'

export default function Page({
  params
}: {
  params: {
    problemId: string
    submissionId: string
  }
}) {
  const { submissionId, problemId } = params

  return (
    <div className="flex flex-col gap-5 overflow-auto p-6">
      <div className="z-20 flex items-center gap-3">
        <Link href={`/problem/${problemId}/submission`}>
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-bold">Submission #{submissionId}</h1>
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
            problemId={Number(problemId)}
            submissionId={Number(submissionId)}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
