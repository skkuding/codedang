'use client'

import { Modal } from '@/components/Modal'
import { ModalSection } from '@/components/ModalSection'
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
      parts.push('Assignments')
    }

    return parts.length > 0
      ? `${parts.join('/')} with this problem`
      : 'Usage of this problem'
  }

  if (contestLoading || assignmentLoading) {
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
        <ModalSection
          title="Upcoming"
          items={[
            ...(contestDataResult?.upcoming ?? []).map((item) => item.title),
            ...(assignmentDataResult?.upcoming ?? []).map((item) => item.title)
          ]}
        />
        <ModalSection
          title="Ongoing"
          items={[
            ...(contestDataResult?.ongoing ?? []).map((item) => item.title),
            ...(assignmentDataResult?.ongoing ?? []).map((item) => item.title)
          ]}
        />
        <ModalSection
          title="Finished"
          items={[
            ...(contestDataResult?.finished ?? []).map((item) => item.title),
            ...(assignmentDataResult?.finished ?? []).map((item) => item.title)
          ]}
        />
      </Modal>
    </>
  ) : null
}
