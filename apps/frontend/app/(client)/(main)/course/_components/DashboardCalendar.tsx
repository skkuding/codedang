'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/shadcn/dialog'
import { Textarea } from '@/components/shadcn/textarea'
import { cn, dateFormatter } from '@/libs/utils'
import type { CalendarAssignment, CalendarAssignmentEvent } from '@/types/type'
import type { EventClickArg } from '@fullcalendar/core/index.js'
// DayGrid 플러그인
//import bootstrap5Plugin from '@fullcalendar/bootstrap5'
// Bootstrap5 테마
//import '@fullcalendar/bootstrap5/main.css'
// FullCalendar 컴포넌트
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import type { Route } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

//import { EventDialog } from './EventDialog'

export function DashboardCalendar({
  data
}: {
  data: CalendarAssignment[] //event color 속성을 추가해서 과목별로 색갈이 다르게해볼 수도 있겠다.
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [SelectedEvent, setSelectedEvent] =
    useState<CalendarAssignmentEvent | null>(null)
  const handleEventClick = (info: EventClickArg) => {
    //캘린터 이벤트 클릭 처리.
    //기본 제공 타입인 EventClickArg 말고 CalendarAssignmentEvent 타입 사용.
    setSelectedEvent({
      event: {
        id: Number(info.event.id),
        title: info.event.title,
        start: info.event.start as Date,
        end: info.event.end as Date
      }
    })
    setIsDialogOpen(true)
  }
  const [memo, setMemo] = useState('')
  const handleSave = () => {
    //메모 저장시 toast 팝업
    toast.success(`Saved memo`)
  }

  return (
    <>
      <div className="container mt-4">
        <style jsx global>{`
          .fc-button-primary {
            background-color: #9784e4 !important;
            border-color: #999999 !important;
          }
          .fc-day-today {
            background-color: #cac1ee !important;
          }
          .fc-event {
            background-color: #e5d9f2 !important;
            color: #a294f9 !important;
            border-color: #cdc1ff !important;
          }
          .fc-event .fc-event-title,
          .fc-event .fc-event-time {
            color: black !important; /* 텍스트 색상 */
          }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="customTwoWeek"
          timeZone="UTC"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,customTwoWeek'
          }}
          views={{
            customTwoWeek: {
              type: 'dayGrid',
              duration: { weeks: 2 },
              buttonText: '2 weeks',
              contentHeight: 500
            }
          }}
          weekNumbers={true}
          dayMaxEvents={true}
          events={data}
          eventClick={handleEventClick}
        />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {SelectedEvent ? ( //조건부 렌더링.
            <>
              <DialogHeader>
                <DialogTitle>{SelectedEvent.event.title}</DialogTitle>
                <DialogDescription>
                  {`마감: ${dateFormatter(SelectedEvent.event.end, 'YYYY년 MM월 DD일 hh시 mm분')}`}
                </DialogDescription>
                <Link
                  href={`/contest`} //assignment 경로가 아직 없어서 일단 링크기능 테스트를 위해 contest쪽으로 넘어가게 설정해둠
                  className={cn(
                    'border-gray-300 text-sm text-gray-500 dark:text-gray-400'
                  )}
                >
                  See More
                </Link>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Textarea
                    placeholder="Memo"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="z-10 h-40 resize-none border-2 border-gray-400 p-3 text-black shadow-none placeholder:text-[#3333334D] focus-visible:ring-0"
                  />
                </div>
              </div>
              <DialogFooter className="flex">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    className="justify-start border-gray-300 hover:text-neutral-400 active:text-neutral-200"
                  >
                    Close
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={handleSave}
                  className="justify-end gap-2 text-white hover:text-neutral-200 active:text-neutral-200"
                >
                  Save
                </Button>
              </DialogFooter>
            </>
          ) : (
            <p>Loading..</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
