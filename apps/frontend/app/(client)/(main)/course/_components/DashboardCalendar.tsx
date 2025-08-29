'use client'

import {
  DayPicker,
  useNavigation,
  type DayPickerSingleProps
} from 'react-day-picker'

export function DashboardCalendar({
  selectedDate,
  onSelect,
  deadlineDateList,
  viewMonth,
  setViewMonth
}: {
  selectedDate?: Date
  onSelect: (date: Date | undefined) => void
  deadlineDateList: Date[]
  viewMonth: Date
  setViewMonth: (m: Date) => void
}) {
  const isOutside = (d: Date) =>
    d.getFullYear() !== viewMonth.getFullYear() ||
    d.getMonth() !== viewMonth.getMonth()

  return (
    <section className="rounded- bg-white shadow-[0_4px_20px_rgba(53,78,116,0.10)]">
      <div className="pb-5 pl-[30px] pr-[30px] pt-[30px]">
        <DayPicker
          className="m-0"
          mode="single"
          showOutsideDays
          weekStartsOn={0}
          month={viewMonth}
          onMonthChange={(m) =>
            setViewMonth(new Date(m.getFullYear(), m.getMonth(), 1))
          }
          selected={selectedDate}
          onSelect={(d) =>
            onSelect(
              d
                ? new Date(d.getFullYear(), d.getMonth(), d.getDate())
                : undefined
            )
          }
          modifiers={{
            deadline: deadlineDateList,
            sunday: (d) => d.getDay() === 0 && !isOutside(d),
            sundayOutside: (d) => d.getDay() === 0 && isOutside(d)
          }}
          formatters={{
            formatWeekdayName: (day) =>
              ['S', 'M', 'T', 'W', 'T', 'F', 'S'][day.getDay()]
          }}
          components={
            {
              Caption: (props) => {
                const { previousMonth, nextMonth, goToMonth } = useNavigation()
                const y = props.displayMonth.getFullYear()
                const m = String(props.displayMonth.getMonth() + 1).padStart(
                  2,
                  '0'
                )
                return (
                  <div className="flex items-center justify-start gap-2 pb-[14px]">
                    <button
                      type="button"
                      className="rounded-full hover:bg-neutral-200 disabled:opacity-40"
                      disabled={!previousMonth}
                      onClick={() => previousMonth && goToMonth(previousMonth)}
                      aria-label="Previous month"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-[14px] w-[14px] stroke-neutral-500"
                      >
                        <path
                          d="M15 19L8 12l7-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <div className="text-[24px] font-semibold leading-[33.6px] tracking-[-0.72px] text-black">{`${y}. ${m}`}</div>
                    <button
                      type="button"
                      className="rounded-full hover:bg-neutral-200 disabled:opacity-40"
                      disabled={!nextMonth}
                      onClick={() => nextMonth && goToMonth(nextMonth)}
                      aria-label="Next month"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-[14px] w-[14px] stroke-neutral-500"
                      >
                        <path
                          d="M9 5l7 7-7 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                )
              }
            } as DayPickerSingleProps['components']
          }
          classNames={{
            caption: 'py-2',
            nav: 'hidden',
            head_row: 'grid grid-cols-7 text-center',
            head_cell:
              'py-2 text-[16px] leading-6 tracking-[-0.48px] font-normal text-neutral-500 first:text-red-500',
            row: 'grid grid-cols-7',
            cell: 'relative p-[2px] sm:p-1 text-center',
            day: 'mx-auto my-1 flex hover:bg-violet-200 h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full font-normal transition',
            day_outside: 'text-neutral-400'
          }}
          modifiersClassNames={{
            today: 'bg-violet-700 text-white border border-violet-700',
            selected: 'bg-violet-200 border border-violet-400',
            sunday: 'text-red-500',
            sundayOutside: '!text-red-300',
            deadline:
              'relative after:absolute after:bottom-[-8px] after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-violet-700'
          }}
        />
      </div>
    </section>
  )
}
