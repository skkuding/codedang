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
import { GET_BELONGED_CONTESTS } from '@/graphql/contest/queries'
import fileInfoIcon from '@/public/icons/file-info.svg'
import { useQuery } from '@apollo/client'
import Image from 'next/image'
import { useState } from 'react'

interface ProblemSectionProps {
  title: string
  contests?: { id: string; title: string }[]
}

function ProblemSection({ title, contests }: ProblemSectionProps) {
  if (!contests || contests.length === 0) {
    return null
  }

  return (
    <div>
      <p className="mb-2 font-bold text-neutral-800">{title}</p>
      {contests.map((contest) => (
        <p key={contest.id} className="text-xs text-neutral-400">
          {contest.title}
        </p>
      ))}
    </div>
  )
}

interface ProblemUsageProps {
  problemId: number
  // target?: 'contest' | 'assignment'
  showContest?: boolean
  showAssignment?: boolean
}

export function ProblemUsage({
  problemId,
  showContest = false,
  showAssignment = false
}: ProblemUsageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: contestData, loading } = useQuery(GET_BELONGED_CONTESTS, {
    variables: {
      problemId
    }
  })

  const contestDataResult = contestData?.getContestsByProblemId

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

  if (loading) {
    return <Skeleton className="size-[25px]" />
  }
  return contestDataResult ? (
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
            title="Upcoming Contest(s)"
            contests={contestDataResult?.upcoming}
          />
        </ModalList>
        <ModalList>
          <ProblemSection
            title="Ongoing Contest(s)"
            contests={contestDataResult?.ongoing}
          />
        </ModalList>
        <ModalList>
          <ProblemSection
            title="Finished Contest(s)"
            contests={contestDataResult?.finished}
          />
        </ModalList>
      </Modal>
    </>
  ) : //   <Dialog onOpenChange={() => setIsTooltipOpen(false)}>
  //     <TooltipProvider>
  //       <Tooltip>
  //         <DialogTrigger asChild>
  //           <TooltipTrigger asChild>
  //             <button
  //               type="button"
  //               className="justify-centert flex items-center"
  //               onClick={(e) => {
  //                 e.stopPropagation()
  //                 setIsTooltipOpen(true)
  //               }}
  //               onMouseEnter={() => setIsTooltipOpen(true)}
  //               onMouseLeave={() => setIsTooltipOpen(false)}
  //             >
  //               <Image src={fileInfoIcon} alt="fileinfo" />
  //             </button>
  //           </TooltipTrigger>
  //         </DialogTrigger>
  //         {isTooltipOpen && (
  //           <TooltipContent className="mr-4 bg-white">
  //             <p className="text-xs text-neutral-900">
  //               Click to check which contests include this problem.
  //             </p>
  //             <TooltipPrimitive.Arrow className="fill-white" />
  //           </TooltipContent>
  //         )}
  //       </Tooltip>
  //     </TooltipProvider>
  //     <div onClick={(e) => e.stopPropagation()}>
  //       <DialogContent className="sm:max-w-[425px]">
  //         <DialogHeader>
  //           <p className="text-lg font-semibold">
  //             Contests which include this problem
  //           </p>
  //         </DialogHeader>
  //         <ProblemSection
  //           title="Upcoming Contest(s)"
  //           contests={contestData?.upcoming}
  //         />
  //         <ProblemSection
  //           title="Ongoing Contest(s)"
  //           contests={contestData?.ongoing}
  //         />
  //         <ProblemSection
  //           title="Finished Contest(s)"
  //           contests={contestData?.finished}
  //         />
  //       </DialogContent>
  //     </div>
  //   </Dialog>

  null
}
