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
import type { CalendarAssignment } from '@/types/type'
import type { EventClickArg } from '@fullcalendar/core/index.js'

/**
FIXME: FullCalendar 기본 제공 타입인 EventClickArg사용시 에러가 나서 CalendarAssignmentEvent 타입으로 대체함.
import type { EventClickArg } from '@fullcalendar/core/index.js'
만약 CalendarAssignmentEvent type 사용시 문제가 된다면 위의 EvnetClickArg type을 사용한다.
*/
// 일단은 EventClickArg을 사용하고, 그로 인해 발생하는 'selectedEvent.event.end'의 null처리를 하였습니다..!
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export function DashboardCalendar({ data }: { data: CalendarAssignment[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null)
  const handleEventClick = (info: EventClickArg) => {
    setSelectedEvent(info)
    setIsDialogOpen(true)
  }
  const [memo, setMemo] = useState('')
  const handleSave = () => {
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
            color: black !important;
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
          displayEventTime={false}
          weekNumbers={true}
          dayMaxEvents={true}
          events={data}
          eventClick={handleEventClick}
        />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedEvent ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.event.title}</DialogTitle>
                <DialogDescription>
                  {selectedEvent.event.end
                    ? `마감: ${dateFormatter(selectedEvent.event.end, 'YYYY년 MM월 DD일 hh시 mm분')}`
                    : '마감일 없음'}
                </DialogDescription>
                <Link
                  href={`/contest`} //FIXME: Assignment 세부 페이지가 구현되면 그 경로로 지정해야한다.
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
                    value={memo} //FIXME: Backend에서 메모 기능을 구현하면 연결해야한다.
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
