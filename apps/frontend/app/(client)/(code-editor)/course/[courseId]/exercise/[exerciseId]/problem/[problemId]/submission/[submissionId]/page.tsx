import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { ErrorBoundary } from '@suspensive/react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { SubmissionDetail } from './_components/SubmissionDetail'
import { SubmissionDetailTitle } from './_components/SubmissionDetailTitle'

export default function Page({
  params
}: {
  params: {
    exerciseId: string
    courseId: string
    problemId: string
    submissionId: string
  }
}) {
  const { courseId, exerciseId, problemId, submissionId } = params

  return (
    <div className="flex flex-col gap-5 overflow-auto py-6">
      <div className="z-20 flex items-center gap-3 px-6">
        <Link
          href={
            `/course/${courseId}/exercise/${exerciseId}/problem/${problemId}/submission` as const
          }
        >
          <ArrowLeft className="size-5" />
        </Link>
        <SubmissionDetailTitle
          problemId={Number(problemId)}
          exerciseId={Number(exerciseId)}
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
            problemId={Number(problemId)}
            exerciseId={Number(exerciseId)}
            submissionId={Number(submissionId)}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
