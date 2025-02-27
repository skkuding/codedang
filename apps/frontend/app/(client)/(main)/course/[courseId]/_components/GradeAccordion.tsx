import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { Dialog } from '@/components/shadcn/dialog'
import { cn, convertToLetter, dateFormatter } from '@/libs/utils'
import { GradeDetailModal } from '../grade/_components/GradeDetailModal'
import { SubmissionDetailModal } from '../grade/_components/SubmissionDetailModal'
import { DetailButton } from './DetailButton'
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
    finalScore: number | null
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
  userAssignmentFinalScore: number | null
  assignmentPerfectScore: number
  problems: ProblemGrade[]
}

export function GradeAccordion({ courseId }: GradeAccordionProps) {
  // TODO: fetch assignment grades
  console.log(courseId)
  return (
    <div className="mt-8">
      <GradeAccordionHeader />
      {dummyResponse.data.map((assignment) => (
        <GradeAccordionItem key={assignment.id} assignment={assignment} />
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
}

function GradeAccordionItem({ assignment }: GradeAccordionItemProps) {
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
            <Dialog>
              <DetailButton isActivated={assignment.isFinalScoreVisible} />
              <GradeDetailModal
                assignmentId={assignment.id}
                week={assignment.week}
              />
            </Dialog>
          </div>
          <p className="w-[20%] text-center font-normal text-[#8A8A8A]">
            {dateFormatter(assignment.endTime, 'YYYY-MM-DD HH:mm:ss')}
          </p>
          <p className="w-[12%] text-center font-medium">
            {`${assignment.userAssignmentFinalScore ?? '-'} / ${assignment.assignmentPerfectScore}`}
          </p>
          <div className="flex w-[14%] justify-center">
            <GradedBadge isGraded={assignment.isFinalScoreVisible} />
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
                  <Dialog>
                    <DetailButton
                      isActivated={problem.problemRecord.finalScore !== null}
                    />
                    <SubmissionDetailModal />
                  </Dialog>
                </div>
                <p className="w-[20%] text-center font-normal text-[#8A8A8A]">
                  -
                </p>
                <p className="w-[12%] text-center font-medium">{`${problem.problemRecord.finalScore ?? '-'} / ${problem.maxScore}`}</p>
                <div className="flex w-[14%] justify-center">
                  {problem.problemRecord.finalScore === null && (
                    <MissingBadge />
                  )}
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
