'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { problemQueries } from '@/app/(client)/_libs/queries/problem'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { Dialog } from '@/components/shadcn/dialog'
import { Skeleton } from '@/components/shadcn/skeleton'
import { cn, convertToLetter, dateFormatter } from '@/libs/utils'
import type {
  Assignment,
  AssignmentGrade,
  AssignmentStatus
} from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { Suspense, useEffect, useState } from 'react'
import { FaFilePen } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { useInterval } from 'react-use'
import { GradeDetailModal } from '../grade/_components/GradeDetailModal'
import { DetailButton } from './DetailButton'
import { SubmissionDetailModal } from './SubmissionDetailModal'

interface GradeAccordionProps {
  courseId: string
}

export function GradeAccordion({ courseId }: GradeAccordionProps) {
  const { data: assignments } = useQuery(
    assignmentQueries.muliple({ courseId })
  )

  console.log(assignments)

  // const { data: assignmentRecords } = useQuery(
  //   assignmentQueries.records({ courseId })
  // )

  return (
    <div className="mt-8">
      {assignments?.map((assignment, index) => (
        <GradeAccordionItem
          key={assignment.id}
          assignment={assignment}
          // record={assignmentRecords?.[index]} // 인덱스로 대응
          courseId={courseId}
        />
      ))}
    </div>
  )
}

interface GradeAccordionItemProps {
  assignment: Assignment
  courseId: string
  // record: AssignmentRecord
}

function GradeAccordionItem({
  assignment,
  courseId
  // record
}: GradeAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)
  const [openProblemId, setOpenProblemId] = useState<number | null>(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const handleOpenChange = (problemId: number | null) => {
    setOpenProblemId(problemId)
  }

  const { data: records } = useQuery({
    ...assignmentQueries.record({ assignmentId: assignment.id.toString() }),
    enabled: isOpen
  })

  const handleAccordionOpenChange = (value: string) => {
    setIsOpen(value === assignment.id.toString())
  }
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      onValueChange={handleAccordionOpenChange}
    >
      <AccordionItem value={assignment.id.toString()} className="border-b-0">
        <AccordionTrigger
          className={cn(
            'mt-4 w-full items-center rounded-2xl bg-white px-8 py-5 text-left text-sm shadow-md',
            'data-[state=open]:-mb-6',
            'relative',
            'hover:no-underline'
          )}
          iconStyle="w-5 h-5 absolute right-[3%]"
        >
          <p className="text-primary w-[7%] text-center font-normal">
            [Week {assignment.week}]
          </p>
          <div className="flex w-[30%] flex-col">
            <p className="line-clamp-1 font-normal">{assignment.title}</p>
            {assignment && <AssignmentStatusTimeDiff assignment={assignment} />}
          </div>
          {assignment && (
            <p className="w-[25%] font-normal text-[#8A8A8A]">
              {dateFormatter(assignment.startTime, 'MMM D, HH:mm:ss')} {'-'}{' '}
              {dateFormatter(assignment.endTime, 'MMM D, HH:mm:ss')}
            </p>
          )}
          <div className="flex w-[13%] justify-center">
            {assignment.startTime < new Date() ? (
              <SubmissionBadge assignment={assignment} />
            ) : null}
          </div>
          {/* TODO: record api 완성되면 수정 */}
          {/* <div className="flex w-[10%] justify-center gap-1 font-medium">
            {record.score ?? <FaFilePen size={16} />}
            {` / ${record.perfectScore}`}
          </div> */}
          <div className="flex w-[5%] justify-center">
            <Dialog
              open={isAssignmentDialogOpen}
              onOpenChange={setIsAssignmentDialogOpen}
            >
              <DetailButton
                isActivated={new Date() > new Date(assignment.endTime)}
              />
              {isAssignmentDialogOpen && (
                <GradeDetailModal
                  courseId={courseId}
                  assignmentId={assignment.id.toString()}
                />
              )}
            </Dialog>
          </div>
          <div className="w-[1%]" />
        </AccordionTrigger>
        <AccordionContent className="-mb-4 w-full">
          {isOpen && (
            <Suspense
              fallback={
                <div className="overflow-hidden rounded-2xl border">
                  <div className="h-6 bg-[#F3F3F3]" />
                  {[...Array(3)].map((_, i) => (
                    <ProblemSkeletonRow key={i} />
                  ))}
                </div>
              }
            >
              <div className="overflow-hidden rounded-2xl border">
                <div className="h-6 bg-[#F3F3F3]" />
                {records?.problems.map((problem, index) => (
                  <div
                    key={problem.id}
                    className="flex w-full items-center justify-between border-b bg-[#F8F8F8] px-8 py-6 last:border-none"
                  >
                    <p className="text-primary w-[7%] text-center font-normal">
                      {convertToLetter(problem.order)}
                    </p>
                    <div className="flex w-[30%]">
                      <span className="line-clamp-1 font-medium text-[#171717]">
                        {problem.title}
                      </span>
                    </div>
                    <div className="w-[25%]">
                      {problem.submissionTime && (
                        <p className="font-normal text-[#8A8A8A]">
                          {dateFormatter(
                            problem.submissionTime,
                            'MMM D, HH:mm:ss'
                          )}
                        </p>
                      )}
                    </div>

                    {/* <div className="flex w-[13%] justify-center">
                    {assignmentGrade.problems.every(
                      (problem) => !problem.problemRecord?.isSubmitted
                    ) ? null : (
                      <AcceptedBadge
                        isAccepted={problem.problemRecord?.isSubmitted ?? false}
                      />
                    )}
                  </div> */}
                    <div className="flex w-[10%] justify-center font-medium">
                      {problem.problemRecord?.finalScore ?? '-'} /{' '}
                      {problem.maxScore}
                    </div>
                    <div className="flex w-[5%] justify-center">
                      <Dialog
                        open={openProblemId === problem.id}
                        onOpenChange={(isOpen) =>
                          handleOpenChange(isOpen ? problem.id : null)
                        }
                      >
                        <DetailButton
                          isActivated={
                            new Date() > new Date(assignment.endTime)
                          }
                        />
                        {openProblemId === problem.id && (
                          <SubmissionDetailModal
                            problemId={problem.id.toString()}
                            gradedAssignment={records}
                            showEvaluation={true}
                          />
                        )}
                      </Dialog>
                    </div>
                    <div className="w-[1%]" />
                  </div>
                ))}
              </div>
            </Suspense>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

dayjs.extend(duration)
interface AssignmentStatusTimeDiffProps {
  assignment: Assignment
}

export function AssignmentStatusTimeDiff({
  assignment
}: AssignmentStatusTimeDiffProps) {
  const [assignmentStatus, setAssignmentStatus] = useState<
    AssignmentStatus | undefined | null
  >(assignment.status)
  const [timeDiff, setTimeDiff] = useState({
    days: 0,
    hours: '00',
    minutes: '00',
    seconds: '00'
  })

  const updateAssignmentStatus = () => {
    const now = dayjs()
    if (now.isAfter(assignment.endTime)) {
      setAssignmentStatus('finished')
    } else if (now.isAfter(assignment.startTime)) {
      setAssignmentStatus('ongoing')
    } else {
      setAssignmentStatus('upcoming')
    }

    const timeRef =
      assignmentStatus === 'ongoing' || assignmentStatus === 'registeredOngoing'
        ? assignment.endTime
        : assignment.startTime

    const diff = dayjs.duration(Math.abs(dayjs(timeRef).diff(now)))
    const days = Math.floor(diff.asDays())
    const hours = Math.floor(diff.asHours() % 24)
    const hourStr = hours.toString().padStart(2, '0')
    const minutes = Math.floor(diff.asMinutes() % 60)
    const minuteStr = minutes.toString().padStart(2, '0')
    const seconds = Math.floor(diff.asSeconds() % 60)
    const secondStr = seconds.toString().padStart(2, '0')

    setTimeDiff({
      days,
      hours: hourStr,
      minutes: minuteStr,
      seconds: secondStr
    })
  }

  useEffect(() => {
    updateAssignmentStatus()
  }, [])

  useInterval(() => {
    updateAssignmentStatus()
  }, 1000)

  return (
    <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-normal text-[#8A8A8A] opacity-80">
      {assignmentStatus === 'finished' ? (
        <>
          Finished
          <p className="overflow-hidden text-ellipsis whitespace-nowrap">
            {timeDiff.days > 0
              ? `${timeDiff.days} DAYS`
              : `${timeDiff.hours}:${timeDiff.minutes}:${timeDiff.seconds}`}
          </p>
          ago
        </>
      ) : (
        <>
          {assignmentStatus === 'ongoing' ||
          assignmentStatus === 'registeredOngoing'
            ? 'Ends in'
            : 'Starts in'}
          <p className="overflow-hidden text-ellipsis whitespace-nowrap">
            {timeDiff.days > 0
              ? `${timeDiff.days} DAYS`
              : `${timeDiff.hours}:${timeDiff.minutes}:${timeDiff.seconds}`}
          </p>
        </>
      )}
    </div>
  )
}

interface SubmissionBadgeProps {
  className?: string
  assignment: Assignment
}

function SubmissionBadge({ className, assignment }: SubmissionBadgeProps) {
  const badgeStyle = assignment.isJudgeResultVisible
    ? 'border-transparent bg-primary text-white'
    : 'border-primary text-primary'
  return (
    <div
      className={cn(
        'flex h-[30px] w-[106px] items-center justify-center rounded-full border',
        badgeStyle,
        className
      )}
    >
      <p className="text-sm font-medium">
        {assignment.submittedNumber} {'/'}
        {assignment.problemNumber}
      </p>
    </div>
  )
}
interface AcceptedBadgeProps {
  className?: string
  isAccepted: boolean
}

function AcceptedBadge({ className, isAccepted }: AcceptedBadgeProps) {
  return (
    isAccepted && (
      <div
        className={cn(
          'bg-primary flex h-[30px] w-[106px] items-center justify-center gap-1 rounded-full border border-transparent text-white',
          className
        )}
      >
        <IoIosCheckmarkCircle />
        <p className="text-sm font-medium">Accepted</p>
      </div>
    )
  )
}

function ProblemSkeletonRow() {
  return (
    <div className="flex w-full items-center justify-between border-b bg-[#F8F8F8] px-8 py-6">
      <Skeleton className="h-4 w-[7%]" />
      <Skeleton className="h-4 w-[30%]" />
      <Skeleton className="h-4 w-[25%]" />
      <Skeleton className="h-4 w-[10%]" />
      <Skeleton className="h-4 w-[5%]" />
    </div>
  )
}
