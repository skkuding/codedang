import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { cn, dateFormatter } from '@/libs/utils'
import Link from 'next/link'

interface AssignmentAccordionProps {
  week: number
}

const dummyAssignmentList = [
  {
    id: 3,
    title: '24년도 소프트웨어학과 신입생 입학 과제2',
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2028-01-01T23:59:59.000Z',
    group: {
      id: 1,
      groupName: 'Example Group'
    },
    invitationCode: '123456',
    enableCopyPaste: true,
    isJudgeResultVisible: true,
    week: 1,
    participants: 1,
    problemCount: 3,
    submittedProblemCount: 1
  },
  {
    id: 1,
    title: 'SKKU Coding Platform 모의과제',
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2028-01-01T23:59:59.000Z',
    group: {
      id: 1,
      groupName: 'Example Group'
    },
    invitationCode: '123456',
    enableCopyPaste: true,
    isJudgeResultVisible: true,
    week: 1,
    participants: 13,
    problemCount: 3,
    submittedProblemCount: 3
  },
  {
    id: 3,
    title: '24년도 소프트웨어학과 신입생 입학 과제2',
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2028-01-01T23:59:59.000Z',
    group: {
      id: 1,
      groupName: 'Example Group'
    },
    invitationCode: '123456',
    enableCopyPaste: true,
    isJudgeResultVisible: true,
    week: 2,
    participants: 1,
    problemCount: 3,
    submittedProblemCount: 2
  },
  {
    id: 1,
    title: 'SKKU Coding Platform 모의과제',
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2028-01-01T23:59:59.000Z',
    group: {
      id: 1,
      groupName: 'Example Group'
    },
    invitationCode: '123456',
    enableCopyPaste: true,
    isJudgeResultVisible: true,
    week: 3,
    participants: 13,
    problemCount: 5,
    submittedProblemCount: 2
  },
  {
    id: 3,
    title: '24년도 소프트웨어학과 신입생 입학 과제2',
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2028-01-01T23:59:59.000Z',
    group: {
      id: 1,
      groupName: 'Example Group'
    },
    invitationCode: '123456',
    enableCopyPaste: true,
    isJudgeResultVisible: true,
    week: 4,
    participants: 1,
    problemCount: 3,
    submittedProblemCount: 3
  },
  {
    id: 1,
    title: 'SKKU Coding Platform 모의과제',
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2028-01-01T23:59:59.000Z',
    group: {
      id: 1,
      groupName: 'Example Group'
    },
    invitationCode: '123456',
    enableCopyPaste: true,
    isJudgeResultVisible: true,
    week: 4,
    participants: 13,
    problemCount: 7,
    submittedProblemCount: 2
  }
]

export function AssignmentAccordion({ week }: AssignmentAccordionProps) {
  return (
    <div className="mt-3">
      {Array.from({ length: week }, (_, i) => i + 1).map((week: number) => (
        <AssignmentAccordionItem key={week} week={week} />
      ))}
    </div>
  )
}

interface AssignmentAccordionItemProps {
  week: number
}

function AssignmentAccordionItem({ week }: AssignmentAccordionItemProps) {
  const assignments = dummyAssignmentList.filter(
    (assignment) => assignment.week === week
  )

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={week.toString()} className="mx-6 border-b-0">
        <AccordionTrigger
          className={cn(
            'mt-4 flex rounded-2xl bg-white px-8 py-4 text-lg font-semibold shadow-md',
            'border border-transparent',
            'data-[state=open]:border-primary data-[state=open]:-mb-6'
          )}
          iconSize="w-7 h-7"
        >
          <div className="relative text-left text-sm">
            <p className="text-primary absolute top-0 w-32 -translate-y-1/2">
              [Week {week}]
            </p>
            <p className="absolute left-32 top-0 w-32 -translate-y-1/2">
              {week}주차
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="-mb-4">
          <div className="overflow-hidden rounded-2xl border">
            <div className="h-6 bg-[#F8F8F8]" />
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <Link
                  href={`assignment/${assignment.id}` as const}
                  key={assignment.id}
                >
                  <div
                    key={assignment.id}
                    className="flex items-center gap-10 border-b bg-[#F8F8F8] px-12 py-4"
                  >
                    <span className="bg-primary h-2 w-2 rounded-full" />
                    <p className="line-clamp-1 w-64 text-sm font-medium text-black">
                      {assignment.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {dateFormatter(
                        assignment.startTime,
                        'YYYY-MM-DD HH:mm:ss'
                      )}{' '}
                      -{' '}
                      {dateFormatter(assignment.endTime, 'YYYY-MM-DD HH:mm:ss')}
                    </p>
                    <CountBadge
                      solvedProblemCount={assignment.submittedProblemCount}
                      problemCount={assignment.problemCount}
                    />
                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-[#F8F8F8] px-8 py-4">
                <p className="text-sm text-slate-500">과제가 없습니다</p>
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

function CountBadge({ solvedProblemCount, problemCount }: CountBadgeProps) {
  const bgColor =
    solvedProblemCount === problemCount ? 'bg-primary' : 'bg-[#C4C4C4]'
  return (
    <div className={cn('rounded-full px-3 py-0.5 text-xs text-white', bgColor)}>
      {solvedProblemCount}/{problemCount}
    </div>
  )
}
