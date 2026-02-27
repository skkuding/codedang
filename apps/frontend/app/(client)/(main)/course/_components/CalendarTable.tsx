'use client'

import { format } from 'date-fns'

type Event = {
  id: string
  title: string
  date: Date
}

const events: Event[] = [
  {
    id: '4220EAEA-D515-4EB5-B71D-67CF223DC42F',
    title: '중간고사',
    date: new Date(2025, 3, 4)
  },
  {
    id: '4220EAEA-D515-4EB5-B71D-67CF223DC42D',
    title: '과제마감',
    date: new Date(2025, 3, 5)
  }
]

export function CalendarTable() {
  return (
    <div className="flex flex-col items-start space-y-2 py-4">
      {events.map((event) => (
        <div key={event.id} className="flex items-center space-x-4">
          <div className="h-6 w-4 rounded-full bg-blue-500" />
          <span className="text-sub1_sb_18">{event.title}</span>
          <span className="text-gray-500">
            {format(event.date, 'yyyy.M.d')}
          </span>
        </div>
      ))}
    </div>
  )
}
