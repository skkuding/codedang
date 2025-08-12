'use client'

import { Modal } from '@/components/Modal'
import { Skeleton } from '@/components/shadcn/skeleton'
//import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { GET_BELONGED_ASSIGNMENTS } from '@/graphql/assignment/queries'
import { GET_BELONGED_CONTESTS } from '@/graphql/contest/queries'
import fileInfoIcon from '@/public/icons/file-info.svg'
import filePen from '@/public/icons/file-pen.svg'
import { useQuery } from '@apollo/client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface ProblemUsageProps {
  problemId: number
  showContest?: boolean
  showAssignment?: boolean
}

interface ProblemSectionProps {
  contents?: { id: string; title: string }[]
}

function HeaderSection({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[6px] self-stretch">
      <div className="bg-primary w-[6px] self-stretch rounded-[1px]" />
      <span className="font-pretendard text-[18px] font-medium leading-[140%] tracking-[-0.54px] text-black">
        {label}
      </span>
    </div>
  )
}

function ProblemSection({ contents }: ProblemSectionProps) {
  console.log(contents)
  return (
    <div className="flex flex-col items-start gap-[10px] self-stretch">
      {contents?.map((content) => (
        <div
          key={content.id}
          className="flex items-center self-stretch rounded-[10px] bg-[#F5F5F5] px-[20px] py-[18px]"
        >
          <div className="flex items-start gap-[10px]">
            <Image src={filePen} alt="filewithpen" />
            <Link href="/course">[Weekly Assignment] Week</Link>
            {content.title}
          </div>
        </div>
      ))}
    </div>
  )
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

  if (contestLoading || assignmentLoading) {
    return <Skeleton className="size-[25px]" />
  }

  return (
    <Modal
      size={'lg'}
      type={'custom'}
      title={'Using this problem'}
      headerDescription={'This problem is used in the following contexts'}
      trigger={<Image src={fileInfoIcon} alt="fileinfo" />}
    />
    // return contestDataResult && assignmentDataResult ? (
    //   <>
    //     <TooltipProvider>
    //       <Tooltip>
    //         <TooltipTrigger asChild>
    //           <button
    //             type="button"
    //             className="flex items-center justify-center"
    //             onClick={() => {
    //               setIsModalOpen(true)
    //             }}
    //           >
    //             <Image src={fileInfoIcon} alt="fileinfo" />
    //           </button>
    //         </TooltipTrigger>
    //         <TooltipContent className="mr-4 bg-white">
    //           <p className="text-xs text-neutral-900">
    //             Click to check which contests include this problem.
    //           </p>
    //         </TooltipContent>
    //       </Tooltip>
    //     </TooltipProvider>

    //     <ScrollArea>
    //       <Modal
    //         open={isModalOpen}
    //         onOpenChange={setIsModalOpen}
    //         size={'lg'}
    //         type={'custom'}
    //         title={'Using this problem'}
    //         headerDescription={'This problem is used in the following contexts'}
    //       >
    //         <ScrollArea className="h-full w-full">
    //           <div className="border-line flex min-h-full flex-col items-start gap-[30px] self-stretch rounded-[16px] border bg-white p-[30px]">
    //             <div className="flex flex-col items-start gap-3 self-stretch">
    //               {assignmentData && <HeaderSection label="Assignment" />}
    //               {assignmentData && (
    //                 <ProblemSection
    //                   contents={
    //                     (assignmentDataResult?.upcoming,
    //                     assignmentDataResult?.ongoing,
    //                     assignmentDataResult?.finished)
    //                   }
    //                 />
    //               )}
    //             </div>
    //             <div className="flex flex-col items-start gap-3 self-stretch">
    //               {contestData && <HeaderSection label="Contest" />}
    //               {contestData && (
    //                 <ProblemSection
    //                   contents={
    //                     (contestDataResult?.upcoming,
    //                     contestDataResult?.ongoing,
    //                     contestDataResult?.finished)
    //                   }
    //                 />
    //               )}
    //             </div>
    //             <div className="flex flex-col items-start gap-3 self-stretch">
    //               <HeaderSection label="Exercise" />
    //             </div>
    //           </div>

    //           {/* <ModalSection
    //             title="Upcoming"
    //             items={[
    //               ...(contestDataResult?.upcoming ?? []).map(
    //                 (item) => item.title
    //               ),
    //               ...(assignmentDataResult?.upcoming ?? []).map(
    //                 (item) => item.title
    //               )
    //             ]}
    //           />
    //           <ModalSection
    //             title="Ongoing"
    //             items={[
    //               ...(contestDataResult?.ongoing ?? []).map((item) => item.title),
    //               ...(assignmentDataResult?.ongoing ?? []).map(
    //                 (item) => item.title
    //               )
    //             ]}
    //           />
    //           <ModalSection
    //             title="Finished"
    //             items={[
    //               ...(contestDataResult?.finished ?? []).map(
    //                 (item) => item.title
    //               ),
    //               ...(assignmentDataResult?.finished ?? []).map(
    //                 (item) => item.title
    //               )
    //             ]}
    //           /> */}
    //         </ScrollArea>
    //       </Modal>
    //     </ScrollArea>
    //   </>
    // ) : null
  )
}
