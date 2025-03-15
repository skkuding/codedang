import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import type { Assignment } from '@/types/type'
import { AssignmentLink } from './AssignmentLink'

interface AssignmentAccordionProps {
  week: number
  courseId: string
}

export async function AssignmentAccordion({
  week,
  courseId
}: AssignmentAccordionProps) {
  const assignments = await getAssignmentList(courseId)

  return (
    <div className="mt-3">
      {Array.from({ length: week }, (_, i) => i + 1).map((week: number) => (
        <AssignmentAccordionItem
          key={week}
          week={week}
          courseId={courseId}
          assignments={assignments}
        />
      ))}
    </div>
  )
}

const getAssignmentList = async (groupId: string) => {
  const response = await safeFetcherWithAuth.get('assignment', {
    searchParams: {
      groupId
    }
  })
  const data = await response.json<Assignment[]>()
  return data
}

interface AssignmentAccordionItemProps {
  week: number
  courseId: string
  assignments: Assignment[]
}

function AssignmentAccordionItem({
  week,
  courseId,
  assignments
}: AssignmentAccordionItemProps) {
  const filteredAssignments = assignments.filter(
    (assignment) => assignment.week === week
  )
  const isCompleted =
    filteredAssignments.length === 0
      ? false
      : filteredAssignments.every((assignment) => {
          return (
            assignment.submittedNumber === assignment.problemNumber &&
            assignment.problemNumber !== 0
          )
        })

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={week.toString()} className="border-b-0">
        <AccordionTrigger
          className={cn(
            'mt-4 flex rounded-2xl bg-white px-8 py-5 text-lg font-semibold shadow-md',
            'border border-transparent',
            'data-[state=open]:border-primary data-[state=open]:-mb-6'
          )}
          iconStyle="w-7 h-7"
        >
          <div className="relative w-full text-left text-base">
            <p className="text-primary absolute top-0 w-32 -translate-y-1/2">
              [Week {week}]
            </p>
            <p className="absolute left-32 top-0 w-32 -translate-y-1/2">
              {week}주차
            </p>
            {filteredAssignments.length !== 0 && (
              <CompleteBadge
                className="absolute right-4 top-0 -translate-y-1/2"
                isCompleted={isCompleted}
              />
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="-mb-4">
          <div className="overflow-hidden rounded-2xl border">
            <div className="h-6 bg-[#F3F3F3]" />
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <AssignmentLink
                  key={assignment.id}
                  assignment={assignment}
                  courseId={courseId}
                />
              ))
            ) : (
              <div className="bg-[#F8F8F8] px-8 py-4">
                <p className="text-sm text-slate-500">
                  There&apos;s no published assignment
                </p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

interface CountBadgeProps {
  solvedProblemCount: number
  problemCount: number
}

export function CountBadge({
  solvedProblemCount,
  problemCount
}: CountBadgeProps) {
  const bgColor =
    solvedProblemCount === problemCount && problemCount !== 0
      ? 'bg-primary'
      : 'bg-[#C4C4C4]'
  return (
    <div
      className={cn(
        'flex h-7 w-[61px] items-center justify-center rounded-full text-base font-semibold text-white',
        bgColor
      )}
    >
      {solvedProblemCount}/{problemCount}
    </div>
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
