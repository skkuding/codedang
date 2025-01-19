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
import { Label } from '@/components/shadcn/label'
import { cn, dateFormatter } from '@/libs/utils'
import type { CalendarAssignment, CalendarAssignmentEvent } from '@/types/type'
// DayGrid 플러그인
//import bootstrap5Plugin from '@fullcalendar/bootstrap5'
// Bootstrap5 테마
//import '@fullcalendar/bootstrap5/main.css'
// FullCalendar 컴포넌트
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import { title } from 'process'
import { useState } from 'react'

//import { EventDialog } from './EventDialog'

export default function DashboardCalendar({
  data
}: {
  data: CalendarAssignment[] //event color 속성을 추가해서 과목별로 색갈이 다르게해볼 수도 있겠다.
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [SelectedEvent, setSelectedEvent] =
    useState<CalendarAssignmentEvent | null>(null)
  const handleEventClick = (info: CalendarAssignmentEvent) => {
    //캘린터 이벤트 클릭 처리.
    //기본 제공 타입인 EventClickArg 말고 CalendarAssignmentEvent 타입 사용.
    setSelectedEvent({
      event: {
        title: info.event.title,
        start: info.event.start,
        end: info.event.end
      }
    })
    setIsDialogOpen(true)
  }

  return (
    <>
      <div className="container mt-4">
        <style jsx global>{`
          .fc-button-primary {
            background-color: #4a90e2 !important;
            border-color: #4a90e2 !important;
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
                  {`시작: ${dateFormatter(SelectedEvent.event.start, 'YYYY-MM-DD')} 종료: ${dateFormatter(SelectedEvent.event.end, 'YYYY-MM-DD')}`}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
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
