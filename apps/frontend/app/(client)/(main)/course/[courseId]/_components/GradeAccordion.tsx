import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { cn, convertToLetter, dateFormatter } from '@/libs/utils'
import { dummyResponse } from './dummy'

interface GradeAccordionProps {
  courseId: string
}

interface ProblemGrade {
  id: number
  title: string
  order: number
  maxScore: number
  problemRecord: {
    finalScore: number
    comment: string
  }
}

interface AssignmentGrade {
  id: number
  title: string
  endTime: string
  isFinalScoreVisible: boolean
  autoFinalizeScore: boolean
  week: number
  userAssignmentFinalScore: number
  assignmentPerfectScore: number
  problems: ProblemGrade[]
}

export function GradeAccordion({ courseId }: GradeAccordionProps) {
  return (
    <div className="mt-3">
      {dummyResponse.data.map((assignment) => (
        <GradeAccordionItem
          key={assignment.id}
          courseId={courseId}
          assignment={assignment}
        />
      ))}
    </div>
  )
}

interface GradeAccordionItemProps {
  courseId: string
  assignment: AssignmentGrade
}

function GradeAccordionItem({ courseId, assignment }: GradeAccordionItemProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value={assignment.week.toString()}
        className="mx-6 border-b-0"
      >
        <AccordionTrigger
          className={cn(
            'mt-4 flex rounded-2xl bg-white px-8 py-5 text-lg font-semibold shadow-md',
            'data-[state=open]:-mb-6'
          )}
          iconSize="w-7 h-7"
        >
          <div className="relative w-full text-left text-sm">
            <p className="text-primary absolute top-0 w-32 -translate-y-1/2">
              [Week {assignment.week}]
            </p>
            <div className="absolute left-20 top-0 flex -translate-y-1/2 gap-4">
              <p>{assignment.title}</p>
              <p className="text-[#8A8A8A]">
                {dateFormatter(assignment.endTime, 'YYYY-MM-DD HH:mm:ss')}
              </p>
              <p>
                {`${assignment.userAssignmentFinalScore} / ${assignment.assignmentPerfectScore}`}
              </p>
              <div>
                {assignment.isFinalScoreVisible ? 'Graded' : 'Submitted'}
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="-mb-4">
          <div className="overflow-hidden rounded-2xl border">
            <div className="h-6 bg-[#F3F3F3]" />
            {assignment.problems.map((problem) => (
              <div
                key={problem.id}
                className="flex items-center justify-between border-b bg-[#F8F8F8] px-12 py-6"
              >
                <div className="flex gap-6">
                  <p>
                    <span className="text-primary">
                      {convertToLetter(problem.order)}
                    </span>{' '}
                    {problem.title}
                  </p>
                  <p>{`${problem.problemRecord.finalScore} / ${problem.maxScore}`}</p>
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
  className: string
  isCompleted: boolean
}

function CompleteBadge({ className, isCompleted }: CompleteBadgeProps) {
  const badgeStyle = isCompleted
    ? 'border-primary text-primary'
    : 'border-[#C4C4C4] text-[#C4C4C4]'
  const text = isCompleted ? 'Complete' : 'Incomplete'
  return (
    <div
      className={cn(
        'flex h-[34px] w-[121px] items-center justify-center rounded-full border',
        badgeStyle,
        className
      )}
    >
      <p className="text-[16px] font-medium">{text}</p>
    </div>
  )
}
