import { Skeleton } from '@/components/shadcn/skeleton'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import { SubmissionAssessment } from './_components/SubmissionAssessment'
import {
  SubmissionSummary,
  SubmissionSummaryError
} from './_components/SubmissionSummary'
import {
  SubmissionTestcase,
  SubmissionTestcaseError
} from './_components/SubmissionTestcase'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-fit flex-col gap-4 px-8 py-6 text-lg">
          <Skeleton className="h-20 w-full rounded-lg bg-slate-900" />
          <Skeleton className="h-8 w-3/12 rounded-lg bg-slate-900" />
          <Skeleton className="h-32 w-full rounded-lg bg-slate-900" />
        </div>
      }
    >
      <div className="flex flex-col gap-1 overflow-auto">
        <div className="px-5 pb-6 pt-6">
          <ErrorBoundary fallback={<SubmissionSummaryError />}>
            <SubmissionSummary />
          </ErrorBoundary>
        </div>

        <div className="h-3 bg-[#121728]" />

        <div className="px-5 pb-6 pt-5">
          <SubmissionAssessment />
        </div>

        <div className="h-3 bg-[#121728]" />

        <div className="px-5 py-2">
          <ErrorBoundary fallback={<SubmissionTestcaseError />}>
            <SubmissionTestcase />
          </ErrorBoundary>
        </div>
      </div>
    </Suspense>
  )
}
