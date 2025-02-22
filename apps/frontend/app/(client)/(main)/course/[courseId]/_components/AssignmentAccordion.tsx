import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { cn, dateFormatter } from '@/libs/utils'

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
    solvedProblemCount: 1
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
    solvedProblemCount: 3
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
    solvedProblemCount: 2
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
    solvedProblemCount: 2
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
    solvedProblemCount: 3
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
    solvedProblemCount: 2
  }
]

export function AssignmentAccordion({ week }: AssignmentAccordionProps) {
  return (
    <>
      {Array.from({ length: week }, (_, i) => i + 1).map((week: number) => (
        <AssignmentAccordionItem key={week} week={week} />
      ))}
    </>
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
    <Accordion type="single" collapsible className="w-[1208px]">
      <AccordionItem value={week.toString()} className="mx-6 border-b-0">
        <AccordionTrigger
          className={cn(
            'mt-4 flex rounded-2xl bg-white px-8 py-6 text-lg font-semibold shadow-md',
            'border border-transparent',
            'data-[state=open]:border-primary data-[state=open]:-mb-6'
          )}
          iconSize="w-7 h-7"
        >
          <div className="relative text-left">
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
              <>
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex gap-10 border-b bg-[#F8F8F8] p-4"
                  >
                    <p className="text-sm font-medium text-black">
                      {assignment.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {dateFormatter(
                        assignment.startTime,
                        'YYYY-MM-DD HH:mm:ss'
                      )}
                      {'      '}-{'      '}
                      {dateFormatter(assignment.endTime, 'YYYY-MM-DD HH:mm:ss')}
                    </p>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex gap-10 border-b bg-[#F8F8F8] p-4">
                <p className="text-sm font-medium text-black">
                  과제가 없습니다
                </p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
