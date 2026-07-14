import { ScrollArea } from '@/components/shadcn/scroll-area'
import type { Assignment } from '@/types/type'
import { AssignmentLink } from '../[courseId]/_components/AssignmentLink'

type WorkStatus = 'upcoming' | 'ongoing' | 'finished'

interface GroupInfo {
  id: number
  groupName: string
}

export interface WorkItem {
  id: number
  title: string
  isExercise: boolean
  startTime: Date
  endTime: Date
  dueTime?: Date
  group: GroupInfo
  problemCount: number
  submittedCount: number
  week?: number
  status?: WorkStatus
  raw: Assignment
}

export interface GroupedRows {
  courseId: number
  courseTitle: string
  courseNum?: string
  classNum?: number
  rows: WorkItem[]
}

interface DashboardCardSectionProps {
  title: string
  groups: GroupedRows[]
  selectedDate?: Date
  courseIdResolver: (row: WorkItem) => number
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const isDueToday = (selectedDate?: Date, dueDate?: Date) =>
  Boolean(selectedDate && dueDate && sameDay(selectedDate, dueDate))

const formatDueMd = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`

export function DashboardCardSection({
  title,
  groups,
  selectedDate,
  courseIdResolver
}: DashboardCardSectionProps) {
  return (
    <section className="flex h-full rounded-[12px] bg-white shadow-[0_4px_20px_rgba(53,78,116,0.10)]">
      <div className="flex w-full max-w-[100vw] flex-col overflow-hidden py-[30px] pl-6 pr-2 md:max-w-[390px]">
        <span className="mb-6 text-[24px] font-semibold leading-[33.6px] tracking-[-0.72px]">
          {title}
        </span>

        <ScrollArea className="flex-1 pr-4 [&>div>div]:!flex [&>div>div]:!flex-col">
          {groups
            .slice()
            .sort(
              (groupA, groupB) =>
                Number(
                  groupB.rows.some((row) =>
                    isDueToday(selectedDate, row.dueTime ?? row.endTime)
                  )
                ) -
                Number(
                  groupA.rows.some((row) =>
                    isDueToday(selectedDate, row.dueTime ?? row.endTime)
                  )
                )
            )
            .filter((group) => group.rows.length)
            .map((group, index) => (
              <div key={group.courseTitle} className="w-full">
                <p className="mb-3 pl-[6px] text-[14px] font-semibold leading-[19.6px] tracking-[-0.42px] text-black">
                  <span className="bg-primary-light mr-2 inline-block h-[22px] w-[6px] rounded-[1px] align-middle" />
                  {group.courseTitle}
                </p>

                <div className="flex flex-col gap-2">
                  {group.rows
                    .slice()
                    .sort((a, b) => {
                      const dueRank =
                        Number(
                          isDueToday(selectedDate, b.dueTime ?? b.endTime)
                        ) -
                        Number(isDueToday(selectedDate, a.dueTime ?? a.endTime))
                      if (dueRank !== 0) {
                        return dueRank
                      }
                      const dueA = a.dueTime?.getTime() ?? a.endTime.getTime()
                      const dueB = b.dueTime?.getTime() ?? b.endTime.getTime()
                      if (dueA !== dueB) {
                        return dueA - dueB
                      }
                      return a.title.localeCompare(b.title)
                    })
                    .map((row) => {
                      const courseId = courseIdResolver(row)

                      return (
                        <div
                          key={row.id}
                          className="group relative w-full overflow-hidden rounded-md bg-neutral-100 transition hover:bg-neutral-200"
                        >
                          <div className="relative flex items-center py-[10px]">
                            <div className="flex min-w-0 flex-1 items-center">
                              <div className="pl-[18px] pr-[10px]">
                                <span className="bg-primary inline-block h-2 w-2 shrink-0 rounded-full" />
                              </div>

                              <div className="min-w-0">
                                <AssignmentLink
                                  assignment={row.raw}
                                  courseId={courseId}
                                  isExercise={row.isExercise}
                                />
                              </div>
                            </div>

                            <span className="text-primary ml-3 w-[70px] shrink-0 whitespace-nowrap pr-[18px] text-right text-sm font-medium tabular-nums">
                              {'~ '}
                              {formatDueMd(row.dueTime ?? row.endTime)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>

                {index < groups.length - 1 && (
                  <hr className="my-6 border-t-[0.5px] border-neutral-100" />
                )}
              </div>
            ))}
        </ScrollArea>
      </div>
    </section>
  )
}
