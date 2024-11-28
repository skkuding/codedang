'use client'

import { submissionQueries } from '@/app/(client)/_libs/queries/submission'
//import FetchErrorFallback from '@/components/FetchErrorFallback'
//import { TanstackQueryErrorBoundary } from '@/components/TanstackQueryErrorBoundary'
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
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import SubmissionDetailContent from './SubmissionDetailContent'

export default function MySubmission({ problem }: { problem: ContestProblem }) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const { contestId: contestIdString } = useParams()
  const contestId = Number(contestIdString) //submissionQueries에서 contestId number로 정의

  const { data: latestSubmissionData, isLoading: isLoadingLatest } = useQuery(
    submissionQueries.list({
      contestId,
      problemId: problem.id,
      take: 1
    })
  )

  const latestSubmission = latestSubmissionData?.data?.[0]
  const latestSubmissionId = latestSubmission?.id ?? 0 //타입 에러 떠서 latestSubmissionId가 undefined일 경우 기본값 0으로 설정

  // 최신 제출물의 상세정보 가져오기
  const { data: submission, isLoading: isLoadingDetail } = useQuery({
    ...submissionQueries.detail({
      contestId,
      submissionId: latestSubmissionId,
      problemId: problem.id
    }),
    enabled: latestSubmissionId !== 0, // 의존적 쿼리, 기본값이 아닌 경우(undefined가 아닌 경우)에만 실행
    throwOnError: true
  })

  // 로딩 상태 처리
  if (isLoadingLatest || isLoadingDetail) {
    return <Skeleton className="size-[25px]" />
  }

  if (!submission) {
    return null
  }

  //ToDo: Error Handling
  return (
    //<TanstackQueryErrorBoundary fallback={FetchErrorFallback}>
    <>
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
    </>
  )
}
