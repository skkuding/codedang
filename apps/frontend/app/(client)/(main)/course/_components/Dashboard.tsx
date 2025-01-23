'use client'

import { Button } from '@/components/shadcn/button'
import { Calendar } from '@/components/shadcn/calendar'
import { Dialog, DialogContent } from '@/components/shadcn/dialog'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import maximizeIcon from '@/public/icons/maximize.svg'
import type { Assignment, CalendarAssignment } from '@/types/type'
import type { Session } from 'next-auth'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { LuCalendar } from 'react-icons/lu'
import { CalendarTable } from './CalendarTable'
import { DashboardCalendar } from './DashboardCalendar'

const getAssignments = async () => {
  const data: {
    ongoing: Assignment[] //Course type 정의 후 수정
    upcoming: Assignment[]
  } = await fetcher.get('assignment/ongoing-upcoming').json() //group으로 해야하나 assignment로 해야하나!!
  data.ongoing.forEach((assignment) => {
    assignment.status = 'ongoing'
  })
  data.upcoming.forEach((assignment) => {
    assignment.status = 'upcoming'
  })
  return data.ongoing.concat(data.upcoming)
}

const getRegisteredAssignments = async () => {
  //현재 등록된 assignments를 불러온다.
  const data: {
    registeredOngoing: Assignment[] //Course Interface를 정의한 뒤 수정해야한다.
    registeredUpcoming: Assignment[]
  } = await fetcherWithAuth
    .get('assignment/ongoing-upcoming-with-registered')
    .json()
  data.registeredOngoing.forEach((assignment) => {
    assignment.status = 'registeredOngoing'
  })
  data.registeredUpcoming.forEach((assignment) => {
    assignment.status = 'registeredUpcoming'
  })
  return data.registeredOngoing.concat(data.registeredUpcoming)
}

export function Dashboard({ session }: { session?: Session | null }) {
  const [data, setData] = useState<Assignment[]>([])
  const [calendarData, setCalendarData] = useState<CalendarAssignment[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = session
        ? await getRegisteredAssignments()
        : await getAssignments()
      const parsedData = fetchedData.map((assignment) => ({
        ...assignment,
        startTime: new Date(assignment.startTime),
        endTime: new Date(assignment.endTime)
      }))
      setData(parsedData)
      const mappedData = fetchedData.map((assignment) => ({
        title: assignment.title,
        start: assignment.startTime,
        end: assignment.endTime
      }))
      setCalendarData(mappedData)
    }
    fetchData()
  }, [session])

  const filteredAssignments = date
    ? data.filter(
        (assignment) =>
          date >= assignment.startTime && date <= assignment.endTime
      )
    : data

  return (
    <>
      <div className="flex rounded-lg border border-neutral-300">
        <div className="flex-[2] border-r border-neutral-300 p-8">
          <h1 className="text-2xl font-bold">내일 할 일!</h1>
          <CalendarTable />
        </div>
        <div className="relative border-r border-neutral-300 p-8">
          <div className="flex">
            <LuCalendar size={25} className="mr-2 mt-[2px]" />
            <h1 className="text-2xl font-bold text-gray-700">Calendar</h1>
          </div>
          <Button
            className="absolute right-1 top-1"
            variant="ghost"
            onClick={() => setIsDialogOpen(true)}
          >
            <Image src={maximizeIcon} alt="check" width={16} height={16} />
          </Button>
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </div>
        <div className="flex-[3] p-8">
          <h1 className="text-2xl font-bold">과제</h1>
          <ul>
            {filteredAssignments.length > 0 &&
              filteredAssignments.map((assignment) => (
                <li key={assignment.id}>
                  {assignment.title} (
                  {assignment.startTime.toLocaleDateString()} -{' '}
                  {assignment.endTime.toLocaleDateString()})
                </li>
              ))}
          </ul>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[1280px] max-w-[1280px]">
          <DashboardCalendar data={calendarData} />
        </DialogContent>
      </Dialog>
    </>
  )
}
