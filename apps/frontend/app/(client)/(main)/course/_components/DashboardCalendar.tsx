'use client'

import type { CalendarAssignment } from '@/types/type'
// DayGrid 플러그인
//import bootstrap5Plugin from '@fullcalendar/bootstrap5'
// Bootstrap5 테마
//import '@fullcalendar/bootstrap5/main.css'
// FullCalendar 컴포넌트
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'

//import 'bootstrap/dist/css/bootstrap.min.css'

export default function DashboardCalendar({
  data
}: {
  data: CalendarAssignment[]
}) {
  return (
    <div className="container mt-4">
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
      />
    </div>
  )
}
