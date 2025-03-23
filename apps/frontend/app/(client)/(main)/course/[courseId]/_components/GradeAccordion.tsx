'use client'

import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { Dialog } from '@/components/shadcn/dialog'
import { cn, convertToLetter, dateFormatter } from '@/libs/utils'
import type { AssignmentGrade } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { GradeDetailModal } from '../grade/_components/GradeDetailModal'
import { DetailButton } from './DetailButton'
import { SubmissionDetailModal } from './SubmissionDetailModal'

interface GradeAccordionProps {
  courseId: string
}

export function GradeAccordion({ courseId }: GradeAccordionProps) {
  const { data } = useQuery(
    assignmentSubmissionQueries.grades({ groupId: Number(courseId) })
  )

  return (
    <div className="mt-8">
      <GradeAccordionHeader />
      {data?.map((assignment) => (
        <GradeAccordionItem
          key={assignment.id}
          assignment={assignment}
          courseId={Number(courseId)}
        />
      ))}
    </div>
  )
}

function GradeAccordionHeader() {
  return (
    <div className="flex h-8 items-center rounded-full bg-[#F5F5F5] px-8 text-center text-sm text-[#8A8A8A]">
      <p className="w-[43%]">Title</p>
      <p className="w-[11%]">Detail</p>
      <p className="w-[20%]">Finished Time</p>
      <p className="w-[12%]">Score</p>
      <p className="w-[14%]">Status</p>
    </div>
  )
}

interface GradeAccordionItemProps {
  assignment: AssignmentGrade
  courseId: number
}

function GradeAccordionItem({ assignment, courseId }: GradeAccordionItemProps) {
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)
  const [openProblemId, setOpenProblemId] = useState<number | null>(null)

  const handleOpenChange = (problemId: number | null) => {
    setOpenProblemId(problemId)
  }
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={assignment.week.toString()} className="border-b-0">
        <AccordionTrigger
          className={cn(
            'mt-4 flex w-full items-center rounded-2xl bg-white px-8 py-5 text-left text-sm shadow-md',
            'data-[state=open]:-mb-6',
            'relative',
            'hover:no-underline'
          )}
          iconStyle="w-5 h-5 absolute left-[41%]"
        >
          <p className="text-primary w-[9%] font-semibold">
            [Week {assignment.week}]
          </p>
          <p className="line-clamp-1 w-[30%] font-medium">{assignment.title}</p>
          <div className="w-[4%]" />
          <div className="flex w-[11%] justify-center">
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
                  gradedAssignment={assignment}
                />
              )}
            </Dialog>
          </div>
          <p className="w-[20%] text-center font-normal text-[#8A8A8A]">
            {dateFormatter(assignment.endTime, 'MMM DD, YYYY HH:mm')}
          </p>
          <p className="w-[12%] text-center font-medium">
            {`${assignment.userAssignmentFinalScore ?? '-'} / ${assignment.assignmentPerfectScore}`}
          </p>
          <div className="flex w-[14%] justify-center">
            {assignment.problems.every(
              (problem) => !problem.problemRecord?.isSubmitted
            ) ? null : (
              <GradedBadge isGraded={assignment.isFinalScoreVisible} />
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="-mb-4 w-full">
          <div className="overflow-hidden rounded-2xl border">
            <div className="h-6 bg-[#F3F3F3]" />
            {assignment.problems.map((problem) => (
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
                        gradedAssignment={assignment}
                        showEvaluation={true}
                      />
                    )}
                  </Dialog>
                </div>
                <p className="w-[20%] text-center font-normal text-[#8A8A8A]">
                  -
                </p>
                <p className="w-[12%] text-center font-medium">{`${problem.problemRecord?.finalScore ?? '-'} / ${problem.maxScore}`}</p>
                <div className="flex w-[14%] justify-center">
                  {!problem.problemRecord ||
                  problem.problemRecord.isSubmitted === false ? (
                    <MissingBadge />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

interface CompleteBadgeProps {
  className?: string
  isGraded: boolean
}

function GradedBadge({ className, isGraded }: CompleteBadgeProps) {
  const badgeStyle = isGraded
    ? 'border-transparent bg-primary text-white'
    : 'border-primary text-primary'
  const text = isGraded ? 'Graded' : 'Submitted'
  return (
    <div
      className={cn(
        'flex h-[30px] w-[106px] items-center justify-center rounded-full border',
        badgeStyle,
        className
      )}
    >
      <p className="text-sm font-medium">{text}</p>
    </div>
  )
}

function MissingBadge() {
  return (
    <div className="bg-level-light-1 text-error flex h-[24px] w-[80px] items-center justify-center rounded-full text-sm font-medium">
      Missing
    </div>
  )
}
