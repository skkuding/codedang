import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { fetcherWithAuth } from '@/lib/utils'
import seeSubmissionIcon from '@/public/icons/see-submission.svg'
import type { SubmissionDetail, Submission, ContestProblem } from '@/types/type'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import SubmissionDetailContent from './SubmissionDetailContent'

interface SubmissionsResponse {
  data: Submission[]
  total: number
}

export default function MySubmission({ problem }: { problem: ContestProblem }) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null)
  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const { contestId } = useParams()

  useEffect(() => {
    const getSubmission = async () => {
      const submissions: SubmissionsResponse = await fetcherWithAuth
        .get(`contest/${contestId}/submission`, {
          searchParams: {
            take: 1,
            problemId: problem.id
          }
        })
        .json()
      const firstSubmission = submissions.data[0]
      setSubmissionId(firstSubmission.id)

      const submission: SubmissionDetail = await fetcherWithAuth
        .get(
          `submission/${firstSubmission.id}?problemId=${problem.id}&contestId=${contestId}`
        )
        .json()
      setSubmission(submission)
    }
    getSubmission()
  }, [contestId, problem.id])

  if (!submission || !submissionId) {
    return <Skeleton className="size-[25px]" />
  }

  return (
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
              submissionId={submissionId}
              problem={problem}
            />
          </DialogContent>
        </div>
      </Dialog>
    </>
  )
}
