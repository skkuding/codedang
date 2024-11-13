import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { fetcherWithAuth } from '@/lib/utils'
// import seeSubmission from '@/public/icons/see-submission.svg'
import type { SubmissionDetail, Submission, ContestProblem } from '@/types/type'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
// import Image from 'next/image'`
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaFileAlt } from 'react-icons/fa'
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
      console.log(contestId, problem.id)
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
                <Button
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsTooltipOpen(true)
                  }}
                  onMouseEnter={() => setIsTooltipOpen(true)}
                  onMouseLeave={() => setIsTooltipOpen(false)}
                >
                  <FaFileAlt />
                </Button>
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
            />
          </DialogContent>
        </div>
      </Dialog>
    </>
  )
}
