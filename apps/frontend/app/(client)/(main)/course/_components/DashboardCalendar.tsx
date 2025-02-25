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
import leftArrow from '@/public/icons/arrow-left.svg'
import rightArrow from '@/public/icons/arrow-right.svg'
import type { CalendarAssignment } from '@/types/type'
import { Calendar } from '@fullcalendar/core'
import type { EventClickArg } from '@fullcalendar/core/index.js'
import dayGridPlugin from '@fullcalendar/daygrid'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import '../style.css'

export function DashboardCalendar({ data }: { data: CalendarAssignment[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null)
  const [memo, setMemo] = useState('')
  const [date, setDate] = useState<Date>()

  const calendarRef = useRef<HTMLDivElement | null>(null)

  const handleEventClick = (info: EventClickArg) => {
    setSelectedEvent(info)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    toast.success(`Saved memo`)
  }

  useEffect(() => {
    const fetchData = () => {
      const sampleData = [
        {
          title: 'Mid-term Exam',
          start: new Date(2025, 1, 21), // 인덱스 1월 >> 2월
          end: new Date(2025, 1, 23), // 마지막일은 포함 안함 >> 2/22일까지임
          color: '#FF9F431F',
          textColor: '#ff9F43'
        },
        {
          title: 'Test',
          start: new Date(2025, 1, 27),
          end: new Date(2025, 1, 28),
          allDay: true,
          color: '#FF9F431F',
          textColor: '#ff9F43'
        },
        {
          title: 'PPT',
          start: new Date(2025, 1, 27),
          end: new Date(2025, 1, 28),
          allDay: true,
          color: '#ffffff',
          textColor: '#00CFE8'
        },
        {
          title: 'Test',
          start: new Date(2025, 1, 27),
          end: new Date(2025, 1, 28),
          allDay: true,
          color: '#FF9F431F',
          textColor: '#ff9F43'
        },
        {
          title: 'Mid-term Exam',
          start: new Date(2025, 2, 6),
          end: new Date(2025, 2, 8),
          allDay: true,
          color: '#7367F01f',
          textColor: '#7367F0'
        }
      ]
      data = sampleData
    }

    fetchData()

    if (calendarRef.current) {
      const calendar = new Calendar(calendarRef.current, {
        plugins: [dayGridPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: false,
        events: data,
        eventClick: handleEventClick,
        displayEventTime: false, // 시간 숨기기
        height: 'auto',
        contentHeight: 700
      })

      calendar.render()

      // 이전 버튼 이벤트
      const prevButton = document.getElementById('prev')
      prevButton?.addEventListener('click', () => {
        calendar.prev()
        setDate(calendar.getDate()) // 상태 업데이트 추가
      })

      // 다음 버튼 이벤트
      const nextButton = document.getElementById('next')
      nextButton?.addEventListener('click', () => {
        calendar.next()
        setDate(calendar.getDate()) // 상태 업데이트 추가
      })

      setDate(calendar.getDate()) // 초기 날짜 설정

      // Cleanup 이벤트 리스너
      return () => {
        prevButton?.removeEventListener('click', () => {
          calendar.prev()
          setDate(calendar.getDate())
        })
        nextButton?.removeEventListener('click', () => {
          calendar.next()
          setDate(calendar.getDate())
        })
        calendar.destroy()
      }
    }
  }, [data])

  return (
    <>
      <div className="p-1">
        <Button id="prev" className="bg-white hover:bg-transparent">
          <Image src={leftArrow} alt="prev" width={10} />
        </Button>
        <Button id="next" className="bg-white hover:bg-transparent">
          <Image src={rightArrow} alt="next" width={10} />
        </Button>
        <span className="text-primary mr-3 text-2xl font-bold">
          {date?.toLocaleString('en-US', { month: 'long' })}
        </span>
        <span className="text-xl font-medium text-gray-500">
          {date?.getFullYear()}
        </span>
      </div>
      <div className="w-full" ref={calendarRef} />
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
