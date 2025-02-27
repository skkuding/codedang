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
  // TODO: fetch assignment grades
  console.log(courseId)
  return (
    <div className="mt-3">
      {dummyResponse.data.map((assignment) => (
        <GradeAccordionItem key={assignment.id} assignment={assignment} />
      ))}
    </div>
  )
}

interface GradeAccordionItemProps {
  assignment: AssignmentGrade
}

function GradeAccordionItem({ assignment }: GradeAccordionItemProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value={assignment.week.toString()}
        className="mx-6 border-b-0"
      >
        <AccordionTrigger
          className={cn(
            'mt-4 flex rounded-2xl bg-white px-8 py-5 text-lg font-semibold shadow-md',
            'data-[state=open]:-mb-6',
            'relative',
            'hover:no-underline'
          )}
          iconSize="w-5 h-5 absolute left-[40%]"
        >
          <div className="flex w-full items-center text-left text-sm">
            <p className="text-primary w-[9%] font-semibold">
              [Week {assignment.week}]
            </p>
            <p className="line-clamp-1 w-[30%] font-medium">
              {assignment.title}
            </p>
            <div className="w-[4%]" />
            <div className="w-[9%] text-center">!!</div>
            <p className="w-[22%] text-center font-normal text-[#8A8A8A]">
              {dateFormatter(assignment.endTime, 'YYYY-MM-DD HH:mm:ss')}
            </p>
            <p className="w-[10%] text-center font-medium">
              {`${assignment.userAssignmentFinalScore} / ${assignment.assignmentPerfectScore}`}
            </p>
            <div className="flex w-[16%] justify-end">
              <GradedBadge isGraded={assignment.isFinalScoreVisible} />
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
