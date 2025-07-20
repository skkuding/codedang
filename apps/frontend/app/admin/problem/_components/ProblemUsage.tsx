'use client'

import { Modal } from '@/components/Modal'
import { ModalList } from '@/components/ModalList'
import { Skeleton } from '@/components/shadcn/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { GET_BELONGED_ASSIGNMENTS } from '@/graphql/assignment/queries'
import { GET_BELONGED_CONTESTS } from '@/graphql/contest/queries'
import fileInfoIcon from '@/public/icons/file-info.svg'
import { useQuery } from '@apollo/client'
import Image from 'next/image'
import { useState } from 'react'

interface ProblemSectionProps {
  title: string
  contests?: { id: string; title: string }[]
  assignments?: { id: string; title: string }[]
}

function ProblemSection({ title, contests, assignments }: ProblemSectionProps) {
  return (
    <div>
      <p className="text-primary mb-2 text-base">{title}</p>
      <ul className="list-disc space-y-2 pl-5">
        {contests?.map((contest) => (
          <li key={contest.id} className="text-xs text-black">
            {contest.title}
          </li>
        ))}
        {assignments?.map((assignment) => (
          <li key={assignment.id} className="text-xs text-black">
            {assignment.title}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface ProblemUsageProps {
  problemId: number
  showContest?: boolean
  showAssignment?: boolean
}

export function ProblemUsage({
  problemId,
  showContest = false,
  showAssignment = false
}: ProblemUsageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: contestData, loading: contestLoading } = useQuery(
    GET_BELONGED_CONTESTS,
    {
      variables: {
        problemId
      }
    }
  )

  const { data: assignmentData, loading: assignmentLoading } = useQuery(
    GET_BELONGED_ASSIGNMENTS,
    {
      variables: {
        problemId
      }
    }
  )

  const contestDataResult = contestData?.getContestsByProblemId
  const assignmentDataResult = assignmentData?.getAssignmentsByProblemId

  const getModalTitle = () => {
    const parts = []
    if (showContest) {
      parts.push('Contests')
    }
    if (showAssignment) {
      parts.push('Courses')
    }

    return parts.length > 0
      ? `${parts.join('/')} with this problem`
      : 'Usage of this problem'
  }

  if (contestLoading && assignmentLoading) {
    return <Skeleton className="size-[25px]" />
  }
  return contestDataResult && assignmentDataResult ? (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center"
              onClick={() => {
                setIsModalOpen(true)
              }}
            >
              <Image src={fileInfoIcon} alt="fileinfo" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="mr-4 bg-white">
            <p className="text-xs text-neutral-900">
              Click to check which contests include this problem.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        size={'md'}
        type={'custom'}
        title={getModalTitle()}
      >
        <ModalList>
          <ProblemSection
            title="Upcoming"
            contests={
              (contestDataResult?.upcoming, assignmentDataResult?.upcoming)
            }
          />
        </ModalList>
        <ModalList>
          <ProblemSection
            title="Ongoing"
            contests={
              (contestDataResult?.ongoing, assignmentDataResult?.ongoing)
            }
          />
        </ModalList>
        <ModalList>
          <ProblemSection
            title="Finished"
            contests={
              (contestDataResult?.finished, assignmentDataResult?.finished)
            }
          />
        </ModalList>
      </Modal>
    </>
  ) : null
}
