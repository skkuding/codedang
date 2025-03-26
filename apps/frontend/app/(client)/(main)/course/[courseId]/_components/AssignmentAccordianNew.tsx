'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { Dialog } from '@/components/shadcn/dialog'
import { cn, convertToLetter, dateFormatter } from '@/libs/utils'
import type { Assignment, AssignmentStatus } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useEffect, useState } from 'react'
import { useInterval } from 'react-use'
import { DetailButton } from './DetailButton'
import { GradeDetailModal } from './GradeDetailModal'
import { SubmissionDetailModal } from './SubmissionDetailModal'

interface GAssignmentAccordianNewProps {
  courseId: string
}

export function AssignmentAccordionNew({
  courseId
}: GAssignmentAccordianNewProps) {
  const { data: assignments } = useQuery(
    assignmentQueries.muliple({ courseId })
  )

  return (
    <div className="mt-8">
      {assignments?.map((assignment, index) => (
        <AssignmentAccordionItem
          key={assignment.id}
          assignment={assignment}
          // record={assignmentRecords?.[index]} // 인덱스로 대응
          courseId={courseId}
        />
      ))}
    </div>
  )
}

interface AssignmentAccordionItemProps {
  assignment: Assignment
  courseId: string
}

function AssignmentAccordionItem({
  assignment,
  courseId
}: AssignmentAccordionItemProps) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false)
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)
  const [openProblemId, setOpenProblemId] = useState<number | null>(null)

  const { data: assignmentGrade } = useQuery({
    ...assignmentQueries.record({ assignmentId: assignment.id.toString() }),
    enabled: isAccordionOpen
  })

  const handleOpenChange = (problemId: number | null) => {
    setOpenProblemId(problemId)
  }

  const handleAccordionOpenChange = (value: string) => {
    setIsAccordionOpen(value === assignment.id.toString())
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
            'mt-4 flex w-full items-center rounded-2xl bg-white px-8 py-5 text-left text-sm shadow-md',
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
            <p className="w-[30%] font-normal text-[#8A8A8A]">
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
                isActivated={
                  assignment.isJudgeResultVisible &&
                  dayjs(assignment.endTime).isAfter(dayjs())
                }
              />
              {isAssignmentDialogOpen && assignmentGrade && (
                <GradeDetailModal
                  courseId={courseId}
                  assignmentGrade={assignmentGrade}
                  assignment={assignment}
                />
              )}
            </Dialog>
          </div>
          <div className="w-[1%]" />
        </AccordionTrigger>
        <AccordionContent className="-mb-4 w-full">
          {isAccordionOpen && assignmentGrade && (
            <div className="overflow-hidden rounded-2xl border">
              <div className="h-6 bg-[#F3F3F3]" />
              {assignmentGrade.problems.map((problem) => (
                <div
                  key={problem.id}
                  className="flex w-full items-center border-b bg-[#F8F8F8] px-8 py-6 last:border-none"
                >
                  <div className="w-[9%]" />
                  <div className="flex w-[30%] gap-3">
                    <span className="text-primary font-semibold">
                      {convertToLetter(problem.order)}
                    </span>{' '}
                    <span className="line-clamp-1 font-medium text-[#171717]">
                      {problem.title}
                    </span>
                  </div>
                  <div className="w-[4%]" />
                  <div className="flex w-[11%] justify-center">
                    <Dialog
                      open={openProblemId === problem.id}
                      onOpenChange={(isOpen) =>
                        handleOpenChange(isOpen ? problem.id : null)
                      }
                    >
                      <DetailButton
                        isActivated={new Date() > new Date(assignment.endTime)}
                      />
                      {openProblemId === problem.id && (
                        <SubmissionDetailModal
                          problemId={problem.id}
                          assignmentGrade={assignmentGrade}
                          showEvaluation={true}
                        />
                      )}
                    </Dialog>
                  </div>
                  <p className="w-[20%] text-center font-normal text-[#8A8A8A]">
                    -
                  </p>
                  <p className="w-[12%] text-center font-medium">{`${problem.problemRecord?.finalScore ?? '-'} / ${problem.maxScore}`}</p>
                </div>
              ))}
            </div>
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
    <div className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-normal text-[#8A8A8A] opacity-80">
      {assignmentStatus === 'finished' ? (
        <>
          Ended
          <p className="overflow-hidden text-ellipsis whitespace-nowrap">
            {timeDiff.days > 0
              ? `${timeDiff.days} days`
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
              ? `${timeDiff.days} days`
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
        {assignment.submittedCount} {'/'}
        {assignment.problemCount}
      </p>
    </div>
  )
}
interface AcceptedBadgeProps {
  className?: string
  isAccepted: boolean
}
