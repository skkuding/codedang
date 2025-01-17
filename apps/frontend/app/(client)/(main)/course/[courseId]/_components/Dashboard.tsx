'use client'

//import bootstrap5Plugin from '@fullcalendar/bootstrap5'
// Bootstrap5 테마
//import '@fullcalendar/bootstrap5/main.css'
//import 'bootstrap/dist/css/bootstrap.min.css'
// FullCalendar 컴포넌트
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import { duration } from 'dayjs'

export default function Dashboard() {
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
        events={[
          { title: 'All Day Event', start: '2025-01-01' },
          { title: 'Long Event', start: '2025-01-07', end: '2025-01-10' },
          { title: 'Repeating Event', start: '2025-01-09T16:00:00' },
          { title: 'Conference', start: '2025-01-14', end: '2025-01-16' },
          {
            title: 'Meeting',
            start: '2025-01-15T10:30:00',
            end: '2025-01-15T12:30:00'
          },
          { title: 'Lunch', start: '2025-01-15T12:00:00' },
          { title: 'Birthday Party', start: '2025-01-16T07:00:00' },
          {
            title: 'Click for Google',
            url: 'http://google.com/',
            start: '2025-01-27'
          }
        ]}
      />
    </div>
  )
}
