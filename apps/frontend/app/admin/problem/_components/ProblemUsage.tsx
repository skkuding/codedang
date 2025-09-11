'use client'

import { Modal } from '@/components/Modal'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { Skeleton } from '@/components/shadcn/skeleton'
import { GET_BELONGED_ASSIGNMENTS } from '@/graphql/assignment/queries'
import { GET_BELONGED_CONTESTS } from '@/graphql/contest/queries'
import arrowRightIcon from '@/public/icons/arrow-right.svg'
import fileInfoIcon from '@/public/icons/file-info.svg'
import filePenIcon from '@/public/icons/file-pen.svg'
import infoGrayIcon from '@/public/icons/info-gray.svg'
import prize from '@/public/icons/prize.svg'
import taskComplete from '@/public/icons/task-complete.svg'
import { useQuery } from '@apollo/client'
import Image from 'next/image'
import Link from 'next/link'

interface ProblemUsageProps {
  problemId: number
  showContest?: boolean
  showAssignment?: boolean
}

interface ProblemGroup {
  id: string
  groupName?: string
  courseInfo?: {
    courseNum?: string
    classNum?: number | null
  } | null
}

interface ProblemContent {
  id: string
  title: string
  week: number
  isExercise: boolean
  group?: ProblemGroup
}

interface ProblemSectionProps {
  contents?: ProblemContent[]
}

interface ContestSectionProps {
  contents?: {
    id: string
    title: string
  }[]
}

function HeaderSection({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[6px] self-stretch">
      <div className="bg-primary w-[6px] self-stretch rounded-[1px]" />
      <span className="text-[18px] font-medium leading-[140%] tracking-[-0.54px] text-black">
        {label}
      </span>
    </div>
  )
}

function AssignmentProblemSection({ contents }: ProblemSectionProps) {
  return (
    <div className="flex flex-col gap-[10px]">
      {contents?.map(
        (content) =>
          content.isExercise === false && (
            <Link
              key={content.id}
              href={`/course/${content.group?.id}/assignment/${content.id}`}
            >
              <div className="bg-color-neutral-99 flex items-center self-stretch rounded-[10px] px-5 py-[18px]">
                <div className="flex items-start gap-[10px]">
                  <Image
                    src={filePenIcon}
                    alt="filePenIcon"
                    className="h-6 w-6"
                  />

                  <div className="flex flex-col">
                    <div className="flex items-center gap-[2px]">
                      <span>
                        [{content.title}] Week {content.week}
                      </span>
                      <Image
                        src={arrowRightIcon}
                        alt="arrowRightIcon"
                        className="text-color-black h-3 w-3"
                      />
                    </div>

                    <span className="text-color-neutral-50 text-sm">
                      [{content.group?.courseInfo?.courseNum}-
                      {content.group?.courseInfo?.classNum}]
                      <span> {content.group?.groupName}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )
      )}
    </div>
  )
}

function ContestProblemSection({ contents }: ContestSectionProps) {
  return (
    <div className="flex flex-col gap-[10px]">
      {contents?.map((content) => (
        <Link key={content.id} href={`/contest/${content.id}`}>
          <div className="bg-color-neutral-99 flex items-center self-stretch rounded-[10px] px-5 py-[18px]">
            <div className="flex items-start gap-[10px]">
              <Image src={prize} alt="prize" />

              <div className="flex items-center gap-[2px] self-stretch hover:brightness-110">
                <span>{content.title}</span>
                <Image
                  src={arrowRightIcon}
                  alt="arrowRightIcon"
                  className="text-color-black h-3 w-3"
                />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function ExerciseProblemSection({ contents }: ProblemSectionProps) {
  return (
    <div className="flex flex-col gap-[10px]">
      {contents?.map(
        (content) =>
          content.isExercise === true && (
            <Link
              key={content.id}
              href={`/course/${content.group?.id}/exercise/${content.id}`}
            >
              <div className="bg-color-neutral-99 flex items-center self-stretch rounded-[10px] px-5 py-[18px]">
                <div className="flex items-start gap-[10px]">
                  <Image
                    src={taskComplete}
                    alt="taskComplete"
                    className="h-6 w-6"
                  />

                  <div className="flex flex-col">
                    <div className="flex items-center gap-[2px]">
                      <span>
                        [{content.title}] Week {content.week}
                      </span>
                      <Image
                        src={arrowRightIcon}
                        alt="arrowRightIcon"
                        className="text-color-black h-3 w-3"
                      />
                    </div>

                    <span className="text-color-neutral-50 text-sm">
                      [{content.group?.courseInfo?.courseNum}-
                      {content.group?.courseInfo?.classNum}]
                      <span> {content.group?.groupName}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )
      )}
    </div>
  )
}

function NoContentsSection({ label }: { label: string }) {
  return (
    <div className="bg-color-neutral-99 flex flex-col items-center justify-center gap-1 self-stretch rounded-lg px-5 pb-10 pt-7">
      <div className="text-color-neutral-80 relative h-7 w-7 overflow-hidden">
        <Image
          src={infoGrayIcon}
          alt="infoGrayIcon"
          className="absolute left-[2.40px] top-[2.40px] h-6 w-6"
        />
      </div>
      <div className="text-color-neutral-80 justify-start self-stretch text-center text-base font-medium">
        No {label} have used this problem
      </div>
    </div>
  )
}

export function ProblemUsage({ problemId }: ProblemUsageProps) {
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

  const hasAssignments =
    (assignmentDataResult?.upcoming?.filter((a) => !a.isExercise).length ?? 0) >
      0 ||
    (assignmentDataResult?.ongoing?.filter((a) => !a.isExercise).length ?? 0) >
      0 ||
    (assignmentDataResult?.finished?.filter((a) => !a.isExercise).length ?? 0) >
      0

  const hasContests =
    (contestDataResult?.upcoming?.length ?? 0) > 0 ||
    (contestDataResult?.ongoing?.length ?? 0) > 0 ||
    (contestDataResult?.finished?.length ?? 0) > 0

  const hasExercises =
    (assignmentDataResult?.upcoming?.filter((a) => a.isExercise).length ?? 0) >
      0 ||
    (assignmentDataResult?.ongoing?.filter((a) => a.isExercise).length ?? 0) >
      0 ||
    (assignmentDataResult?.finished?.filter((a) => a.isExercise).length ?? 0) >
      0

  if (contestLoading || assignmentLoading) {
    return <Skeleton className="size-[25px]" />
  }
  return (
    <Modal
      size="lg"
      type="custom"
      title="Using this problem"
      headerDescription="This problem is used in the following contexts"
      trigger={<Image src={fileInfoIcon} alt="fileinfo" />}
    >
      <ScrollArea className="h-full w-full pr-2">
        <div className="border-line flex min-h-0 flex-col items-start gap-[30px] self-stretch rounded-[16px] border bg-white p-[30px]">
          <div className="flex flex-col gap-3 self-stretch">
            <HeaderSection label="Assignment" />
            {hasAssignments ? (
              <div className="flex w-full flex-col">
                <AssignmentProblemSection
                  contents={[
                    ...(assignmentDataResult?.upcoming ?? []),
                    ...(assignmentDataResult?.ongoing ?? []),
                    ...(assignmentDataResult?.finished ?? [])
                  ]}
                />
              </div>
            ) : (
              <NoContentsSection label="assignments" />
            )}
          </div>

          <div className="flex flex-col items-start gap-3 self-stretch">
            <HeaderSection label="Contest" />
            {hasContests ? (
              <div className="flex w-full flex-col">
                <ContestProblemSection
                  contents={[
                    ...(contestDataResult?.upcoming ?? []),
                    ...(contestDataResult?.ongoing ?? []),
                    ...(contestDataResult?.finished ?? [])
                  ]}
                />
              </div>
            ) : (
              <NoContentsSection label="contests" />
            )}
          </div>

          <div className="flex flex-col items-start gap-3 self-stretch">
            <HeaderSection label="Exercise" />
            {hasExercises ? (
              <div className="flex w-full flex-col">
                <ExerciseProblemSection
                  contents={[
                    ...(assignmentDataResult?.upcoming ?? []),
                    ...(assignmentDataResult?.ongoing ?? []),
                    ...(assignmentDataResult?.finished ?? [])
                  ]}
                />
              </div>
            ) : (
              <NoContentsSection label="exercises" />
            )}
          </div>
        </div>
      </ScrollArea>
    </Modal>
  )
}
