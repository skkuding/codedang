import { submissionQueries } from '@/app/(client)/_libs/queries/submission'
import {
  Dialog,
  DialogTrigger,
  DialogContent
} from '@/components/shadcn/dialog'
import { Skeleton } from '@/components/shadcn/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import seeSubmissionIcon from '@/public/icons/see-submission.svg'
import type { ContestProblem } from '@/types/type'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { ErrorBoundary } from '@suspensive/react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import SubmissionDetailContent from './SubmissionDetailContent'

function MySubmissionContent({ problem }: { problem: ContestProblem }) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const { contestId: contestIdString } = useParams()
  const contestId = Number(contestIdString)

  const { data: latestSubmissionData, isLoading: isLoadingLatest } = useQuery(
    submissionQueries.list({
      contestId,
      problemId: problem.id,
      take: 1
    })
  )

  const latestSubmission = latestSubmissionData?.data?.[0]
  const latestSubmissionId = latestSubmission?.id ?? 0

  const { data: submission, isLoading: isLoadingDetail } = useQuery({
    ...submissionQueries.detail({
      contestId,
      submissionId: latestSubmissionId,
      problemId: problem.id
    }),
    enabled: latestSubmissionId !== 0,
    throwOnError: true
  })

  if (isLoadingLatest || isLoadingDetail) {
    return <Skeleton className="size-[25px]" />
  }

  if (!submission) {
    return null
  }

  return (
    <Dialog onOpenChange={() => setIsTooltipOpen(false)}>
      <TooltipProvider>
        <Tooltip>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <Image
                src={seeSubmissionIcon}
                width={20}
                height={20}
                alt={'See submission'}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsTooltipOpen(true)
                }}
                onMouseEnter={() => setIsTooltipOpen(true)}
                onMouseLeave={() => setIsTooltipOpen(false)}
              />
            </TooltipTrigger>
          </DialogTrigger>
          {isTooltipOpen && (
            <TooltipContent className="mr-4 bg-white">
              <p className="text-xs text-neutral-900">
                Click to check your latest submission.
              </p>
              <TooltipPrimitive.Arrow className="fill-white" />
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <div onClick={(e) => e.stopPropagation()}>
        <DialogContent className="max-h-[620px] max-w-[800px] justify-center">
          <SubmissionDetailContent
            submission={submission}
            submissionId={latestSubmissionId}
            problem={problem}
          />
        </DialogContent>
      </div>
    </Dialog>
  )
}

export default function MySubmission({ problem }: { problem: ContestProblem }) {
  return (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={<Skeleton className="size-[25px]" />}>
        <MySubmissionContent problem={problem} />
      </Suspense>
    </ErrorBoundary>
  )
}
