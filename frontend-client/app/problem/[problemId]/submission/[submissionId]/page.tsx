import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import SubmissionDetail from '../_components/SubmissionDetail'

export default async function Page({
  params
}: {
  params: {
    problemId: number
    submissionId: number
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
      <Suspense
        fallback={
          <div className="flex h-fit flex-col gap-4 p-2 text-lg">
            <Skeleton className="h-20 w-full rounded-lg bg-slate-900" />
            <Skeleton className="h-8 w-3/12 rounded-lg bg-slate-900" />
            <Skeleton className="h-32 w-full rounded-lg bg-slate-900" />
          </div>
        }
      >
        <SubmissionDetail problemId={problemId} submissionId={submissionId} />
      </Suspense>
    </div>
  )
}
